pipeline {
    agent any
    environment {
        // ระบุ path ของไฟล์ docker-compose.yml
        DOCKER_COMPOSE_FILE = "docker-compose.yml"
        COMPOSE_BAKE = 'true'
        
        // MongoDB Credentials
        MONGO_INITDB_ROOT_USERNAME = credentials('MONGO_INITDB_ROOT_USERNAME')
        MONGO_INITDB_ROOT_PASSWORD = credentials('MONGO_INITDB_ROOT_PASSWORD')
        MONGO_INITDB_DATABASE = credentials('MONGO_INITDB_DATABASE')
        DATABASE_URL = credentials('DATABASE_URL')
        
        // Application Credentials
        SECRET_KEY = credentials('SECRET_KEY')
        TOKEN_EXPIRES_IN = '12h'
        PORT = '3000'
        ENCRYPTION_KEY = credentials('ENCRYPTION_KEY')
        ENCRYPTION_IV = credentials('ENCRYPTION_IV')
        
        // Email Configuration
        TRAINIFY_EMAIL = credentials('TRAINIFY_EMAIL')
        TRAINIFY_EMAIL_PASSWORD = credentials('TRAINIFY_EMAIL_PASSWORD')
        
        // Super Admin Configuration
        TEST_SUPER_ADMIN_EMAIL = credentials('SUPER_ADMIN_EMAIL')
        TEST_SUPER_ADMIN_PASSWORD = credentials('SUPER_ADMIN_PASSWORD')
        TEST_SUPER_ADMIN_FIRST_NAME = 'Super'
        TEST_SUPER_ADMIN_LAST_NAME = 'Admin'
        TEST_SUPER_ADMIN_PHONE = credentials('SUPER_ADMIN_PHONE')
   
        // Admin Credentials
        TEST_ADMIN_EMAIL = credentials('TEST_ADMIN_EMAIL')
        TEST_ADMIN_PASSWORD = credentials('TEST_ADMIN_PASSWORD')
        TEST_ADMIN_FIRST_NAME = credentials('TEST_ADMIN_FIRST_NAME')
        TEST_ADMIN_LAST_NAME = credentials('TEST_ADMIN_LAST_NAME')
        TEST_ADMIN_PHONE = credentials('TEST_ADMIN_PHONE')

        ROBOT_TESTS_DIR = "robot/script"
        ROBOT_RESULTS_DIR = "results"

    }

    stages {
        stage('Clone Repository') {
            steps{
                echo "Cloning repository..."
                checkout([
                    $class : 'GitSCM',
                    branches : [[name : '*/main']],
                    userRemoteConfigs :[[
                        credentialsId: '76fb8aa3-686a-47ae-863a-772e8e12c160',
                        url: 'https://github.com/AnemoneTK/Trainify-V.2.git'
                    ]]
                ])
                echo "Clone Success"
            }
        }

        stage('Setup Environment') {
            steps {
                script {
                    // สร้างไฟล์ .env จากตัวแปรที่กำหนดใน credentials
                    sh '''
                        echo "# MongoDB Configuration" > .env
                        echo "MONGO_INITDB_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME}" >> .env
                        echo "MONGO_INITDB_ROOT_PASSWORD=${MONGO_INITDB_ROOT_PASSWORD}" >> .env
                        echo "MONGO_INITDB_DATABASE=${MONGO_INITDB_DATABASE}" >> .env
                        echo "DATABASE_URL=${DATABASE_URL}" >> .env
                        
                        echo "# Application Configuration" >> .env
                        echo "NODE_ENV=production" >> .env
                        echo "PORT=${PORT}" >> .env
                        echo "SECRET_KEY=${SECRET_KEY}" >> .env
                        echo "TOKEN_EXPIRES_IN=${TOKEN_EXPIRES_IN}" >> .env
                        echo "ENCRYPTION_KEY=${ENCRYPTION_KEY}" >> .env
                        echo "ENCRYPTION_IV=${ENCRYPTION_IV}" >> .env
                        
                        echo "# Email Configuration" >> .env
                        echo "SMTP_HOST=smtp.gmail.com" >> .env
                        echo "SMTP_PORT=587" >> .env
                        echo "SMTP_USER=${TRAINIFY_EMAIL}" >> .env
                        echo "SMTP_PASS=${TRAINIFY_EMAIL_PASSWORD}" >> .env
                        
                        echo "# Super Admin Configuration" >> .env
                        echo "SUPER_ADMIN_EMAIL=${SUPER_ADMIN_EMAIL}" >> .env
                        echo "SUPER_ADMIN_PASSWORD=${SUPER_ADMIN_PASSWORD}" >> .env
                        echo "SUPER_ADMIN_FIRST_NAME=${SUPER_ADMIN_FIRST_NAME}" >> .env
                        echo "SUPER_ADMIN_LAST_NAME=${SUPER_ADMIN_LAST_NAME}" >> .env
                        echo "SUPER_ADMIN_PHONE=${SUPER_ADMIN_PHONE}" >> .env
                        
                        echo "# Client Configuration" >> .env
                        echo "VITE_API_URL=http://localhost:3000/api" >> .env
                    '''
                    
                    // สร้างไฟล์ .env เฉพาะสำหรับ Server
                    sh '''
                        cp .env Server/.env
                    '''
                    
                    // สร้างไฟล์ .env เฉพาะสำหรับ Client
                    sh '''
                        echo "VITE_API_URL=http://localhost:3000/api" > Client/.env
                    '''

                    sh '''
                        echo "🔍 Jenkins Environment Variable Diagnostics 🔍"
                        echo "----------------------------------------"
                        
                        # MongoDB Configuration
                        echo "MongoDB Username: ${MONGO_INITDB_ROOT_USERNAME:0:3}***"
                        echo "MongoDB Database: ${MONGO_INITDB_DATABASE}"
                        echo "Database URL: ${DATABASE_URL:0:10}***"
                        
                        # Application Configuration
                        echo "Node Environment: ${NODE_ENV}"
                        echo "Port: ${PORT}"
                        echo "Token Expires In: ${TOKEN_EXPIRES_IN}"
                        
                        # Encryption Configuration
                        echo "Encryption Key: ${ENCRYPTION_KEY:0:3}***"
                        echo "Encryption IV: ${ENCRYPTION_IV:0:3}***"
                        
                        # Email Configuration
                        echo "SMTP Host: ${SMTP_HOST}"
                        echo "SMTP Port: ${SMTP_PORT}"
                        echo "SMTP User: ${TRAINIFY_EMAIL:0:5}***"
                        
                        # Super Admin Configuration
                        echo "Super Admin Email: ${SUPER_ADMIN_EMAIL:0:5}***"
                        echo "Super Admin First Name: ${SUPER_ADMIN_FIRST_NAME}"
                        echo "Super Admin Last Name: ${SUPER_ADMIN_LAST_NAME}"
                        echo "Super Admin Phone: ${SUPER_ADMIN_PHONE:0:4}***"
                        
                        # Client Configuration
                        echo "Vite API URL: ${VITE_API_URL}"
                        
                        echo "----------------------------------------"
                        echo "🔍 Validation Checks 🔍"
                        
                        # Basic Validation Checks
                        if [ -z "${MONGO_INITDB_ROOT_USERNAME}" ]; then
                            echo "❌ WARNING: MongoDB Username is EMPTY"
                        fi
                        
                        if [ -z "${DATABASE_URL}" ]; then
                            echo "❌ WARNING: Database URL is EMPTY"
                        fi
                        
                        if [ -z "${SUPER_ADMIN_EMAIL}" ]; then
                            echo "❌ WARNING: Super Admin Email is EMPTY"
                        fi
                        
                        if [ -z "${TRAINIFY_EMAIL}" ]; then
                            echo "❌ WARNING: SMTP User Email is EMPTY"
                        fi
                    '''
                }
            }
        }

        stage('Check Docker Version') {
            steps {
                script {
                    echo "Checking Docker version..."
                    // เพิ่ม path สำหรับ Docker ที่ติดตั้งผ่าน Homebrew
                    sh '''
                        export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
                        docker --version
                        docker-compose --version
                        docker compose --version
                    '''
                }
            }
        }

        stage('Clean Docker') {
            steps {
                script {
                    sh """
                        export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
                        docker system prune -af --volumes
                    """
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    echo "Current directory: ${pwd()}"
                    echo "Listing files:"
                    sh 'ls -l'
                    echo "Building Docker image..."
                    sh """
                        export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
                        docker-compose -f $DOCKER_COMPOSE_FILE up -d --build
                    """
                }
            }
        }
        stage('Robot Test') {
            steps {
                script {
                    echo "Running Robot Framework tests..."
                    def workspace = pwd()
                    
                    // รวมคำสั่ง robot เป็นคำสั่งเดียว
                    sh """
                        /opt/anaconda3/bin/robot \
                        --outputdir ${workspace}/robot/result \
                        --variable SA_EMAIL:${SUPER_ADMIN_EMAIL} \
                        --variable SA_PASS:${SUPER_ADMIN_PASSWORD} \
                        --variable ADMIN_EMAIL:${TEST_ADMIN_EMAIL} \
                        --variable ADMIN_PASS:${TEST_ADMIN_PASSWORD} \
                        --variable ADMIN_PHONE:${TEST_ADMIN_PHONE} \
                        ${workspace}/robot/script/trainify_test.robot
                    """
                }
            }
            post {
                always {
                    sh "ls -la ${ROBOT_RESULTS_DIR}"
                    sh "ls -la ${ROBOT_RESULTS_DIR}/*" 
                    
                    archiveArtifacts artifacts: "${ROBOT_RESULTS_DIR}/**/*", fingerprint: true
                    
                    robot outputPath: "${ROBOT_RESULTS_DIR}", 
                        passThreshold: 80.0, 
                        unstableThreshold: 60.0
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished!'
        }
        success {
            echo 'Build and deploy completed successfully!'
        }
        failure {
            echo 'Build or deploy failed!'
        }
    }
}
