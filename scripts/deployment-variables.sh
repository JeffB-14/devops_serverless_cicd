#!/bin/bash

set -euo pipefail

# Variables:

#### USED BY BOTH git-setup.sh and stack-deploy.sh
#####################
# A name for your CloudFormation stack
# This can optionally be adjusted
STACK_NAME=SampleProject

##### ONLY USED BY git-setup.sh
#####################
# Relative path to local folder (that does not exist) to store git project 
# This can optionally be adjusted
LOCAL_REPO_FOLDER=../sample-project

##### ONLY USED BY stack-deploy.sh
#####################
# Name of an S3 bucket to be created -- MUST BE GLOBALLY UNIQUE!
# This must be set to a new value
S3_BUCKET=MY-UNIQUE-BUCKETNAME
# AWS Account IDs
# These must be set to the correct values
DEV_ACCOUNT_ID=123456789123
PROD_ACCOUNT_ID=123456789123
# Prefix for files in S3 bucket. 
# Default is fine for most scenarios, this can optionally be adjusted
S3_PREFIX=AWS-CICD-Devops-SampleApplication
