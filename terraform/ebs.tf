resource "aws_volume_attachment" "ebs_attachment" {
  instance_id = aws_instance.stylos_ec2.id
  volume_id   = "vol-07655d16c442acd21"
  device_name = "/dev/xvdf"
}
