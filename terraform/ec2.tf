resource "aws_instance" "stylos_ec2" {
  ami           = var.ami_id
  instance_type = var.instance_type
  key_name      = var.key_name

  security_groups = [aws_security_group.stylos_sg.name]
  iam_instance_profile = aws_iam_instance_profile.ssm_instance_profile.name

  availability_zone = "us-east-1a"

  tags = {
    Name = "stylos-ec2-instance"
  }

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }
}

resource "aws_eip_association" "stylos_eip" {
  instance_id   = aws_instance.stylos_ec2.id
  allocation_id = "eipalloc-0016ff067468c6caa"
}
