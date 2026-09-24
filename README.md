# create-gcp-ts

## Node Project

Use this template if you want to run your project directly in Node.js.

> **Important – Replace Placeholders:**  
> Before first use, adjust the placeholders in the following template files:

- **`cloudbuild.yaml`**: `<SCOPE>`, `<REGION>`, `<PROJECT_ID>`, `<REPOSITORY_ID>`
- **`LICENSE`**: `<YEAR>`, `<AUTHOR_OR_ORGANIZATION>`
- **`package.json`**: Name, author, repository URLs, etc.
- **`terraform.tfvars`** (or `terraform.tfvars.example`): GCP and GitHub values

## Cloud Project Setup (One-Time)

```shell
# Create a new project
gcloud projects create <PROJECT_ID> --name="<PROJECT_NAME>"

# List projects
gcloud projects list

# Check billing
gcloud billing projects describe <PROJECT_ID>
gcloud billing accounts list

# Link billing account
gcloud billing projects link <PROJECT_ID> --billing-account=<BILLING_ACCOUNT_ID>
```

Create `.npmrc` in the root folder:

```npmrc
@<SCOPE>:registry=https://<REGION>-npm.pkg.dev/<PROJECT_ID>/<REPOSITORY_ID>/
```

## GitHub Connection (One-Time)

- Google Cloud Console => CI/CD => Cloud Build => Repositories
- 2nd gen => Create host connection
  - Region: europe-west3 (Frankfurt)
  - Name: <GITHUB_CONNECTION_NAME>
  - Connect
- Use existing GitHub installation
  - Select your GitHub account / organization
- GitHub Login => Settings => Applications => Installed GitHub Apps => Google Cloud Build => Configure => Repository access => Select repo
- Back in Google Cloud => Select current project
  - Connect repository
  - Region: europe-west3 (Frankfurt)
- 2nd gen => Link repository
  - Connection: <GITHUB_CONNECTION_NAME>
  - Repository: `<Repo>`

## Infrastructure Provisioning

```shell
# Set main.tf variables

# Find github_connection_name with
gcloud builds connections list --region=<REGION> --project=<PROJECT_ID>
# NAME e.g. my-github-connection

# Find gcp_repository_name with
gcloud builds repositories list --connection=<GITHUB_CONNECTION_NAME> --region=<REGION> --project=<PROJECT_ID>
# NAME e.g. my-org-my-repo
```

Fill in Terraform variables and create `terraform.tfvars`:

```tfvars
project_id             = "your-gcp-project-id"
region                 = "europe-west3"
github_connection_name = "your-github-connection"
github_repo_name       = "your-repo-name"
gcp_repository_name    = "your-cloudbuild-repo-resource-name"
target_branch          = "main"
npm_repository_id      = "shared-npm-repo"
```

`terraform.tfvars` contains local infrastructure metadata and must not be committed. The included `.gitignore` excludes it, `.npmrc`, Terraform state, plans, and overrides.

```shell
# In the directory containing main.tf
terraform init
terraform apply
```
