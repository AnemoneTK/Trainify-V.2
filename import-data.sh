#!/bin/bash
# import-data.sh

# ใช้ค่าที่กำหนดใน environment หรือใช้ค่าดีฟอลต์
MONGO_URI=${MONGO_URI:-"mongodb://mongodb:27017/trainify"}
DATA_DIR=${DATA_DIR:-"/import-data"}

echo "Starting data import process..."
echo "Using MongoDB URI: $MONGO_URI"
echo "Using Data Directory: $DATA_DIR"

# รอให้ MongoDB พร้อมใช้งาน
echo "Waiting for MongoDB to be ready..."
until mongosh --quiet $MONGO_URI --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
  echo "MongoDB not ready yet, waiting 2 seconds..."
  sleep 2
done
echo "MongoDB is ready!"

# ตรวจสอบว่าแผนกมีอยู่แล้วหรือไม่
echo "Checking if departments collection exists and has data..."
DEPT_COUNT=$(mongosh --quiet $MONGO_URI --eval "db.departments.countDocuments({})")
if [ "$DEPT_COUNT" -eq "0" ]; then
  echo "Importing departments..."
  mongoimport --uri $MONGO_URI --collection departments --file $DATA_DIR/departments.json --jsonArray
  if [ $? -eq 0 ]; then
    echo "Departments imported successfully!"
  else
    echo "Failed to import departments data!"
    exit 1
  fi
  
  echo "Checking if users collection exists and has data..."
  USER_COUNT=$(mongosh --quiet $MONGO_URI --eval "db.users.countDocuments({})")
  
  if [ "$USER_COUNT" -eq "0" ]; then
    echo "Importing users..."
    mongoimport --uri $MONGO_URI --collection users --file $DATA_DIR/users.json --jsonArray
    if [ $? -eq 0 ]; then
      echo "Users imported successfully!"
    else
      echo "Failed to import users data!"
      exit 1
    fi
  else
    echo "Users collection already has data. Skipping import."
  fi
  
  echo "Checking if tags collection exists and has data..."
  TAG_COUNT=$(mongosh --quiet $MONGO_URI --eval "db.tags.countDocuments({})")
  
  if [ "$TAG_COUNT" -eq "0" ]; then
    echo "Importing tags..."
    mongoimport --uri $MONGO_URI --collection tags --file $DATA_DIR/tags.json --jsonArray
    if [ $? -eq 0 ]; then
      echo "Tags imported successfully!"
    else
      echo "Failed to import tags data!"
      exit 1
    fi
  else
    echo "Tags collection already has data. Skipping import."
  fi
  
  echo "Data import completed successfully!"
else
  echo "Departments collection already has data. Skipping all imports."
fi