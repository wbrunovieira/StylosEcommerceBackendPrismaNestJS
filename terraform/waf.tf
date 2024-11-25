resource "aws_wafv2_web_acl" "stylos_waf" {
  name        = "stylos-waf"
  scope       = "REGIONAL"  
  description = "WAF for Stylos backend"

 
  default_action {
    allow {}
  }


  rule {
    name     = "block-sql-injection"
    priority = 1

    statement {
      sqli_match_statement {
        field_to_match {
          all_query_arguments {}
        }

        text_transformation {
          priority = 0
          type     = "URL_DECODE"
        }
      }
    }

    action {
      block {}
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "sqlInjection"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "block-xss"
    priority = 2

    statement {
      xss_match_statement {
        field_to_match {
          all_query_arguments {}
        }

        text_transformation {
          priority = 0
          type     = "HTML_ENTITY_DECODE"
        }
      }
    }

    action {
      block {}
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "xssMatch"
      sampled_requests_enabled   = true
    }
  }


  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "stylosWAF"
    sampled_requests_enabled   = true
  }
}
