output "instance_public_ip" {
  value       = aws_instance.stylos_ec2.public_ip
  description = "Public IP address of the EC2 instance"
}

output "rds_endpoint" {
  value       = data.aws_db_instance.stylos_rds.endpoint
  description = "RDS Endpoint"
}

output "s3_bucket_url" {
  value       = "https://${aws_s3_bucket.images_bucket.bucket_regional_domain_name}"
  description = "The URL of the images S3 bucket with the region explicitly included"
}

output "cloudwatch_log_group" {
  value = aws_cloudwatch_log_group.application_logs.name
}

output "cloudwatch_alarm" {
  value = aws_cloudwatch_metric_alarm.high_cpu.alarm_name
}

output "github_oauth_token" {
  value = var.github_oauth_token
}

output "amplify_app_id" {
  value = aws_amplify_app.frontend_app.id
  description = "ID of the Amplify app"
}



output "amplify_branch_id" {
  value = aws_amplify_branch.frontend_branch.id
  description = "ID of the Amplify branch"
}

output "amplify_app_url" {
  value = aws_amplify_app.frontend_app.default_domain
}

output "github_connection_arn" {
  value = aws_codestarconnections_connection.github_connection.arn
}


