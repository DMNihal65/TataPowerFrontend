echo "installing nessery requirements for application..."

# npm install

echo "Building the application..."
# npm run build



echo "Deploying files to server..."
scp -r dist/* smc@172.18.7.91:/var/www/tatapowerdoc/

echo "Done...!"