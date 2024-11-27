resource "aws_cloudwatch_log_group" "application_logs" {
  name              = "/aws/stylos-application-logs"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_stream" "application_log_stream" {
  name           = "stylos-log-stream"
  log_group_name = aws_cloudwatch_log_group.application_logs.name
}

