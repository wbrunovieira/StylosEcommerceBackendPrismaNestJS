resource "aws_ssm_parameter" "parameters" {
  for_each    = var.parameters
  name        = "/app/${each.key}"
  value       = each.key == "BASE_IMAGE_URL" ? "https://${aws_s3_bucket.images_bucket.bucket_domain_name}" : each.value.value
  type        = each.value.type
  description = "Parameter for ${each.key}"

  tags = {
    Environment = var.environment
  }
}
