output "api_base_url" {
  description = "Base URL API (añade /api/... como en local)."
  value       = aws_apigatewayv2_api.http.api_endpoint
}

output "rds_endpoint" {
  value     = aws_db_instance.postgres.address
  sensitive = true
}

output "db_password" {
  value     = random_password.db.result
  sensitive = true
}

output "secrets_arn" {
  value = aws_secretsmanager_secret.app.arn
}
