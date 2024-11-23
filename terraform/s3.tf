resource "aws_s3_bucket" "images_bucket" {
  bucket = "stylos-images-bucket"

  tags = {
    Name        = "Stylos Images Bucket"
    Environment = "Production"
  }
}


resource "aws_s3_bucket" "logs_bucket" {
  bucket = "stylos-logs-bucket"

  tags = {
    Name        = "Stylos Logs Bucket"
    Environment = "Production"
  }
}

resource "aws_s3_bucket_ownership_controls" "logs_bucket_ownership" {
  bucket = aws_s3_bucket.logs_bucket.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_logging" "images_bucket_logging" {
  bucket        = aws_s3_bucket.images_bucket.id
  target_bucket = aws_s3_bucket.logs_bucket.id
  target_prefix = "s3-access-logs/"
}


resource "aws_s3_bucket_versioning" "images_bucket_versioning" {
  bucket = aws_s3_bucket.images_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_policy" "images_bucket_policy" {
  bucket = aws_s3_bucket.images_bucket.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "AllowSpecificIAMAccess",
        Effect    = "Allow",
        Principal = {
          AWS = "arn:aws:iam::761018873312:role/SSMAccessRole"
        },
        Action    = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket"
        ],
        Resource = [
          "arn:aws:s3:::stylos-images-bucket",
          "arn:aws:s3:::stylos-images-bucket/*"
        ]
      }
    ]
  })
}


