provider "aws" {
  region = "us-east-1"
}


data "aws_db_instance" "stylos_rds" {
  db_instance_identifier = "stylos-db"
}


resource "aws_eip" "stylos_eip" {
  instance = aws_instance.stylos_ec2.id
  vpc      = true

  tags = {
    Name        = "stylos-elastic-ip"
    Environment = "Production"
    Team        = "Stylos"
  }
}


resource "aws_security_group" "rds_sg" {
  name        = "stylos-rds-sg"
  description = "Allow PostgreSQL connections from EC2"
  vpc_id      = "vpc-03e6cba84a57cc1ca"

  ingress {
    description = "PostgreSQL access from EC2"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    security_groups = [aws_security_group.stylos_ec2_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "stylos-rds-security-group"
    Environment = "Production"
    Team        = "Stylos"
  }
}


resource "aws_security_group" "stylos_ec2_sg" {
  name        = "stylos-ec2-sg"
  description = "Allow SSH, HTTP, HTTPS, and PostgreSQL"
  vpc_id      = "vpc-03e6cba84a57cc1ca"

  ingress {
    description = "Allow SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] 
  }

  ingress {
    description = "Allow HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "stylos-ec2-security-group"
    Environment = "Production"
    Team        = "Stylos"
  }
}


resource "aws_instance" "stylos_ec2" {
  ami             = "ami-0866a3c8686eaeeba"
  instance_type   = "t3.micro"
  key_name        = "stylos"
  subnet_id       = "subnet-0fcf397f856182508"
  security_groups = [aws_security_group.stylos_ec2_sg.id]

  tags = {
    Name        = "stylos-ec2"
    Environment = "Production"
    Team        = "Stylos"
  }

  root_block_device {
    volume_type = "gp3"
    volume_size = 8
  }

  depends_on = [aws_eip.stylos_eip]
}


output "ec2_public_ip" {
  value       = aws_eip.stylos_eip.public_ip
  description = "Public IP of the EC2 instance"
}

output "rds_endpoint" {
  value       = data.aws_db_instance.stylos_rds.endpoint
  description = "RDS Endpoint"
}

output "rds_instance_identifier" {
  value       = data.aws_db_instance.stylos_rds.db_instance_identifier
  description = "Identifier of the existing RDS instance"
}
