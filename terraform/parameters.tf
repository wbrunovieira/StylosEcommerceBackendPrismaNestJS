resource "aws_ssm_parameter" "parameters" {
  for_each    = var.parameters
  name        = "/app/${each.key}"            
  value       = each.value.value             
  type        = each.value.type             
  description = "Parameter for ${each.key}"  
  overwrite   = true                         
  tags = {
    Environment = var.environment           
  }
}
