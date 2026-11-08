variable "aws_region" {
  type        = string
  description = "Región AWS (ej. eu-central-1 para DE-LU cercano)."
  default     = "eu-central-1"
}

variable "project_name" {
  type    = string
  default = "volty"
}

variable "environment" {
  type    = string
  default = "prod"
}

variable "vpc_cidr" {
  type    = string
  default = "10.20.0.0/16"
}

variable "enable_nat_gateway" {
  type        = bool
  description = "NAT para Lambdas en VPC que llaman APIs externas (ingesta). ~$32/mes; desactivar solo en pruebas sin ingesta."
  default     = true
}

variable "db_username" {
  type    = string
  default = "volty"
}

variable "db_name" {
  type    = string
  default = "volty"
}

variable "jwt_secret" {
  type      = string
  sensitive = true
}

variable "gemini_api_key" {
  type      = string
  sensitive = true
  default   = ""
}

variable "lambda_zip_api" {
  type        = string
  description = "Ruta al zip generado con scripts/build-lambdas.sh"
  default     = "../build/api.zip"
}

variable "lambda_zip_ingestion" {
  type    = string
  default = "../build/ingestion.zip"
}

variable "lambda_zip_ai" {
  type    = string
  default = "../build/ai.zip"
}

variable "lambda_zip_optimization" {
  type    = string
  default = "../build/optimization.zip"
}

variable "ingestion_schedule" {
  type        = string
  description = "Cron EventBridge (UTC) para precios day-ahead."
  default     = "cron(0 5,11,17 * * ? *)"
}

variable "frontend_allowed_origins" {
  type        = list(string)
  description = "CORS para la API (URLs del front estático)."
  default     = ["https://volty.example"]
}
