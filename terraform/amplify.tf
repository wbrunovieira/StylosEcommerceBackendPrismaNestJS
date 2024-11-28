data "aws_ssm_parameter" "base_image_url" {
  name = "/app/BASE_IMAGE_URL"
}

data "aws_ssm_parameter" "nextauth_url" {
  name = "/app/NEXTAUTH_URL"
}

data "aws_ssm_parameter" "next_public_base_url" {
  name = "/app/NEXT_PUBLIC_BASE_URL"
}

data "aws_ssm_parameter" "nextauth_secret" {
  name = "/app/NEXTAUTH_SECRET"
}

data "aws_ssm_parameter" "next_public_google_client_id" {
  name = "/app/NEXT_PUBLIC_GOOGLE_CLIENT_ID"
}

data "aws_ssm_parameter" "next_public_google_client_secret" {
  name = "/app/NEXT_PUBLIC_GOOGLE_CLIENT_SECRET"
}

data "aws_ssm_parameter" "next_public_base_url_backend" {
  name = "/app/NEXT_PUBLIC_BASE_URL_BACKEND"
}

data "aws_ssm_parameter" "next_public_mercado_pago_public_key" {
  name = "/app/NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY"
}

resource "aws_amplify_app" "frontend_app" {
  name                = "StylosFrontend"
  repository          = "https://github.com/wbrunovieira/stylosFrontEcommerce"
  
  # If using GitHub App, you may no longer need an oauth_token
  # oauth_token         = var.oauth_token  # Remove this line as OAuth is no longer required
  
 
  access_token        = var.github_app_access_token  
  
  build_spec = <<BUILD_SPEC
version: 1.0
frontend:
  phases:
    preBuild:
      commands:
        - echo "Instalando dependências"
        - npm install
    build:
      commands:
        - echo "Construindo projeto"
        - npm run build
  artifacts:
    baseDirectory: /build  # Diretório onde a build será gerada
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
BUILD_SPEC

  custom_rule {
    source = "/<*>"  # Redireciona todas as requisições para o index.html
    target = "/index.html"
    status = "200"
  }
}


resource "aws_amplify_branch" "frontend_branch" {
  app_id       = aws_amplify_app.frontend_app.id  # Alterado de app_id para id
  branch_name  = "main"  
  
  environment_variables = {
    "BASE_IMAGE_URL"                = data.aws_ssm_parameter.base_image_url.value
    "NEXTAUTH_URL"                  = data.aws_ssm_parameter.nextauth_url.value
    "NEXT_PUBLIC_BASE_URL"          = data.aws_ssm_parameter.next_public_base_url.value
    "NEXTAUTH_SECRET"               = data.aws_ssm_parameter.nextauth_secret.value
    "NEXT_PUBLIC_GOOGLE_CLIENT_ID"  = data.aws_ssm_parameter.next_public_google_client_id.value
    "NEXT_PUBLIC_GOOGLE_CLIENT_SECRET" = data.aws_ssm_parameter.next_public_google_client_secret.value
    "NEXT_PUBLIC_BASE_URL_BACKEND" = data.aws_ssm_parameter.next_public_base_url_backend.value
    "NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY" = data.aws_ssm_parameter.next_public_mercado_pago_public_key.value
  }
}
