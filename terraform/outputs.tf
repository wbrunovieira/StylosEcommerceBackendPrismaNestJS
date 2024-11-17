output "instance_public_ip" {
  value       = aws_instance.stylos_ec2.public_ip
  description = "Public IP address of the EC2 instance"
}

output "rds_endpoint" {
  value       = data.aws_db_instance.stylos_rds.endpoint
  description = "RDS Endpoint"
}
