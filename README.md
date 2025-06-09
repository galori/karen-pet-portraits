# Web server

`./server.sh`

# Generate list of photos:

`find photos -type f > photos_list.txt`


AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID_PET_PORTRAITS AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY AWS_ENDPOINT_URL_S3=https://fly.storage.tigris.dev AWS_ENDPOINT_URL_IAM=https://fly.iam.storage.tigris.dev AWS_REGION=auto aws s3 cp . s3://karenpetportraits --recursive --exclude ".git/*"