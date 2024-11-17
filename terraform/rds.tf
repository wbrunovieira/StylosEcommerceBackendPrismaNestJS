data "aws_db_instance" "stylos_rds" {
  db_instance_identifier = var.db_instance_identifier
}
