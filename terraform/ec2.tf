resource "aws_instance" "stylos_ec2" {
  ami           = var.ami_id
  instance_type = var.instance_type
  key_name      = var.key_name

  security_groups = [aws_security_group.stylos_sg.name]
  iam_instance_profile = aws_iam_instance_profile.ssm_instance_profile.name

user_data = <<-EOF
              #!/bin/bash
              yum update -y
              yum install -y amazon-cloudwatch-agent
              mkdir -p /opt/aws/amazon-cloudwatch-agent/bin
              cat > /opt/aws/amazon-cloudwatch-agent/bin/config.json << EOL
              {
                "metrics": {
                  "append_dimensions": {
                    "InstanceId": "$${aws:InstanceId}"
                  },
                  "metrics_collected": {
                    "cpu": {
                      "measurement": [
                        "cpu_usage_idle",
                        "cpu_usage_iowait",
                        "cpu_usage_user",
                        "cpu_usage_system"
                      ],
                      "metrics_collection_interval": 60
                    },
                    "mem": {
                      "measurement": [
                        "mem_used_percent",
                        "mem_available_percent"
                      ],
                      "metrics_collection_interval": 60
                    },
                    "disk": {
                      "measurement": [
                        "used_percent",
                        "free"
                      ],
                      "resources": [
                        "/"
                      ],
                      "metrics_collection_interval": 60
                    }
                  }
                }
              }
              EOL
              /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a start -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json
EOF


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

resource "aws_sns_topic" "alarm_notification" {
  name = "stylos-alarm-notification"
}

resource "aws_sns_topic_subscription" "email_subscription" {
  topic_arn = aws_sns_topic.alarm_notification.arn
  protocol  = "email"
  endpoint  = "your-email@example.com"
}

resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "HighCPUUtilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Average"
  threshold           = 80

  alarm_actions = [aws_sns_topic.alarm_notification.arn]

  dimensions = {
    InstanceId = aws_instance.stylos_ec2.id
  }

  tags = {
    Environment = "Production"
  }
}

resource "aws_cloudwatch_metric_alarm" "high_memory" {
  alarm_name          = "HighMemoryUsage"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "mem_used_percent"
  namespace           = "CWAgent"
  period              = 60
  statistic           = "Average"
  threshold           = 80

  alarm_actions = [aws_sns_topic.alarm_notification.arn]

  dimensions = {
    InstanceId = aws_instance.stylos_ec2.id
  }

  tags = {
    Environment = "Production"
  }
}

resource "aws_cloudwatch_metric_alarm" "high_disk" {
  alarm_name          = "HighDiskUsage"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "disk_used_percent"
  namespace           = "CWAgent"
  period              = 60
  statistic           = "Average"
  threshold           = 80

  alarm_actions = [aws_sns_topic.alarm_notification.arn]

  dimensions = {
    InstanceId = aws_instance.stylos_ec2.id,
    path       = "/"
  }

  tags = {
    Environment = "Production"
  }
}

