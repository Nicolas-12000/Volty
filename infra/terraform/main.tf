data "aws_availability_zones" "available" {
  state = "available"
}

resource "random_password" "db" {
  length  = 24
  special = false
}

# ── Red: VPC, subnets privadas (RDS + Lambda), NAT solo si hace falta ingesta ──

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
}

resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 4, count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
}

resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 4, count.index + 8)
  availability_zone = data.aws_availability_zones.available.names[count.index]
}

resource "aws_eip" "nat" {
  count  = var.enable_nat_gateway ? 1 : 0
  domain = "vpc"
}

resource "aws_nat_gateway" "nat" {
  count         = var.enable_nat_gateway ? 1 : 0
  allocation_id = aws_eip.nat[0].id
  subnet_id     = aws_subnet.public[0].id
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
}

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id
  dynamic "route" {
    for_each = var.enable_nat_gateway ? [1] : []
    content {
      cidr_block     = "0.0.0.0/0"
      nat_gateway_id = aws_nat_gateway.nat[0].id
    }
  }
}

resource "aws_route_table_association" "private" {
  count          = 2
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}

# ── Seguridad ──

resource "aws_security_group" "lambda" {
  name        = "${var.project_name}-lambda"
  description = "Salida a internet (NAT) y RDS"
  vpc_id      = aws_vpc.main.id
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds"
  description = "PostgreSQL solo desde Lambdas"
  vpc_id      = aws_vpc.main.id
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda.id]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ── RDS (privado) ──

resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_db_instance" "postgres" {
  identifier                 = "${var.project_name}-${var.environment}"
  engine                     = "postgres"
  engine_version             = "16.3"
  instance_class             = "db.t4g.micro"
  allocated_storage          = 20
  db_name                    = var.db_name
  username                   = var.db_username
  password                   = random_password.db.result
  db_subnet_group_name       = aws_db_subnet_group.main.name
  vpc_security_group_ids     = [aws_security_group.rds.id]
  publicly_accessible        = false
  storage_encrypted          = true
  backup_retention_period    = 7
  skip_final_snapshot        = var.environment != "prod"
  deletion_protection        = var.environment == "prod"
  apply_immediately          = true
}

# ── Secretos ──

resource "aws_secretsmanager_secret" "app" {
  name = "${var.project_name}/${var.environment}/app"
}

resource "aws_secretsmanager_secret_version" "app" {
  secret_id = aws_secretsmanager_secret.app.id
  secret_string = jsonencode({
    DATABASE_URL     = "postgresql+psycopg://${var.db_username}:${random_password.db.result}@${aws_db_instance.postgres.address}:5432/${var.db_name}"
    JWT_SECRET       = var.jwt_secret
    GEMINI_API_KEY   = var.gemini_api_key
    DEMO_USER_EMAIL  = "demo@volty.dev"
    DEMO_USER_PASSWORD = "valle-0700"
  })
}

# ── IAM ──

data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda" {
  name               = "${var.project_name}-lambda"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

locals {
  database_url = "postgresql+psycopg://${var.db_username}:${random_password.db.result}@${aws_db_instance.postgres.address}:5432/${var.db_name}"
  lambda_env = {
    DATABASE_URL         = local.database_url
    BIDDING_ZONE         = "DE-LU"
    TIMEZONE             = "Europe/Berlin"
    JWT_SECRET           = var.jwt_secret
    GEMINI_API_KEY       = var.gemini_api_key
    CORS_ORIGINS         = join(",", var.frontend_allowed_origins)
    MATIAS_THREAD_STORE  = "postgres"
    MATIAS_BACKEND       = "gemini"
    DEMO_USER_EMAIL      = "demo@volty.dev"
    DEMO_USER_PASSWORD   = "valle-0700"
    DEMO_USER_NAME       = "Hogar demo"
  }
}

# ── Lambdas ──

resource "aws_lambda_function" "ai" {
  function_name    = "${var.project_name}-ai"
  role             = aws_iam_role.lambda.arn
  handler          = "handler.lambda_handler"
  runtime          = "python3.12"
  timeout          = 30
  memory_size      = 256
  filename         = var.lambda_zip_ai
  source_code_hash = filebase64sha256(var.lambda_zip_ai)

  environment {
    variables = local.lambda_env
  }
}

resource "aws_lambda_function" "optimization" {
  function_name    = "${var.project_name}-optimization"
  role             = aws_iam_role.lambda.arn
  handler          = "handler.lambda_handler"
  runtime          = "python3.12"
  timeout          = 60
  memory_size      = 1024
  filename         = var.lambda_zip_optimization
  source_code_hash = filebase64sha256(var.lambda_zip_optimization)

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = local.lambda_env
  }
}

resource "aws_lambda_function" "api" {
  function_name    = "${var.project_name}-api"
  role             = aws_iam_role.lambda.arn
  handler          = "handler.lambda_handler"
  runtime          = "python3.12"
  timeout          = 29
  memory_size      = 512
  filename         = var.lambda_zip_api
  source_code_hash = filebase64sha256(var.lambda_zip_api)

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = merge(local.lambda_env, {
      AI_LAMBDA_NAME  = aws_lambda_function.ai.function_name
      OPT_LAMBDA_NAME = aws_lambda_function.optimization.function_name
    })
  }
}

resource "aws_lambda_function" "ingestion" {
  function_name = "${var.project_name}-ingestion"
  role          = aws_iam_role.lambda.arn
  handler       = "handler.lambda_handler"
  runtime       = "python3.12"
  timeout       = 120
  memory_size   = 512
  filename      = var.lambda_zip_ingestion
  source_code_hash = filebase64sha256(var.lambda_zip_ingestion)

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = local.lambda_env
  }
}

# ── API Gateway (HTTP) ──

resource "aws_apigatewayv2_api" "http" {
  name          = "${var.project_name}-http"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = var.frontend_allowed_origins
    allow_methods = ["DELETE", "GET", "OPTIONS", "PATCH", "POST"]
    allow_headers = ["authorization", "content-type"]
  }
}

resource "aws_apigatewayv2_integration" "api" {
  api_id                 = aws_apigatewayv2_api.http.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "default" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.api.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http.execution_arn}/*/*"
}

# ── EventBridge → ingesta ──

resource "aws_cloudwatch_event_rule" "ingestion" {
  name                = "${var.project_name}-ingestion"
  schedule_expression = var.ingestion_schedule
}

resource "aws_cloudwatch_event_target" "ingestion" {
  rule      = aws_cloudwatch_event_rule.ingestion.name
  target_id = "ingestion"
  arn       = aws_lambda_function.ingestion.arn
}

resource "aws_lambda_permission" "eventbridge_ingestion" {
  statement_id  = "AllowEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ingestion.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.ingestion.arn
}

data "aws_iam_policy_document" "lambda_app" {
  statement {
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [aws_secretsmanager_secret.app.arn]
  }
  statement {
    actions = ["lambda:InvokeFunction"]
    resources = [
      aws_lambda_function.ai.arn,
      aws_lambda_function.optimization.arn,
    ]
  }
}

resource "aws_iam_role_policy" "lambda_app" {
  name   = "${var.project_name}-lambda-app"
  role   = aws_iam_role.lambda.id
  policy = data.aws_iam_policy_document.lambda_app.json
}
