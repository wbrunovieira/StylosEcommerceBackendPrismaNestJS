resource "aws_instance" "stylos_ec2" {
  ami           = var.ami_id
  instance_type = var.instance_type
  key_name      = var.key_name

  security_groups = [aws_security_group.stylos_sg.name]

  availability_zone = "us-east-1a"

  tags = {
    Name = "stylos-ec2-instance"
  }

  user_data = <<-EOF
    #!/bin/bash
    sudo mkfs.ext4 /dev/xvdf
    sudo mkdir -p /mnt/data
    sudo mount /dev/xvdf /mnt/data
    echo "/dev/xvdf /mnt/data ext4 defaults 0 0" | sudo tee -a /etc/fstab
  EOF
}

resource "aws_eip_association" "stylos_eip" {
  instance_id   = aws_instance.stylos_ec2.id
  allocation_id = "eipalloc-0016ff067468c6caa"
}
