

variable "db_instance_identifier" {
  description = "The identifier of the existing RDS database instance in AWS."
  type        = string
}

variable "key_name" {
  description = "The name of the SSH key pair used to access the EC2 instance."
  default     = "stylos"
}

variable "instance_type" {
  description = "The type of EC2 instance used for the application. Example: t3.micro."
  default     = "t3.micro"
}

variable "ami_id" {
  description = "The ID of the AMI image used to launch the EC2 instance."
  default     = "ami-0866a3c8686eaeeba"
}

variable "security_group" {
  description = "The name of the Security Group used to configure access rules for the EC2 instance."
  default     = "stylos-security-group"
}

variable "db_access_cidr" {
  description = "The CIDR block allowed to access the database (e.g., developer IP or office network)."
  default     = "0.0.0.0/0" 
}

variable "trusted_ip" {
  description = "The trusted IP address allowed to access the EC2 instance via SSH."
  type        = string
}


variable "aws_region" {
  description = "The AWS region where resources will be created."
  default     = "us-east-1" 
  
}


