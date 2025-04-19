pipeline {
    agent any
    environment {
        // ระบุ path ของไฟล์ docker-compose.yml
        DOCKER_COMPOSE_FILE = "docker-compose.yml"
        COMPOSE_BAKE = 'true'
        // ROBOT_TESTS_DIR = "Robot/script"
        // ROBOT_RESULTS_DIR = "Robot/result"

        MONGO_INITDB_ROOT_USERNAME=credentials('MONGO_INITDB_ROOT_USERNAME')
        MONGO_INITDB_ROOT_PASSWORD=credentials('MONGO_INITDB_ROOT_PASSWORD')
        MONGO_INITDB_DATABASE=credentials('MONGO_INITDB_DATABASE')
        DATABASE_URL=credentials('DATABASE_URL')
        Secret_Key=credentials('Secret_Key')
        TOKEN_EXPIRES_IN = '12h'
        PORT = '3000'
        ENCRYPTION_KEY=credentials('ENCRYPTION_KEY')
        ENCRYPTION_IV=credentials('ENCRYPTION_IV')
        Trainify_Email=credentials('Trainify_Email')
        Trainify_Email_Password=credentials('Trainify_Email_Password')
        SUPER_ADMIN_EMAIL=credentials('SUPER_ADMIN_EMAIL')
        SUPER_ADMIN_PASSWORD=credentials('SUPER_ADMIN_PASSWORD')
        SUPER_ADMIN_FIRST_NAME='Super'
        SUPER_ADMIN_LAST_NAME='Admin'
        SUPER_ADMIN_PHONE=credentials('SUPER_ADMIN_PHONE')

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
                        echo "DATABASE_URL=${DATABASE_URL}" > .env
                        echo "NODE_ENV=production" >> .env
                        echo "PORT=3000" >> .env
                        echo "JWT_SECRET=${JWT_SECRET}" >> .env
                        echo "EMAIL_SERVICE=gmail" >> .env
                        echo "EMAIL_USER=your-app@gmail.com" >> .env
                        echo "EMAIL_PASS=${EMAIL_PASSWORD}" >> .env
                        echo "VITE_API_URL=http://localhost:3000/api" >> .env
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

        stage('Build') {
            steps {
                script {
                    echo "Current directory: ${pwd()}"
                    echo "Listing files:"
                    sh 'ls -l'
                    echo "Building Docker image..."
                    sh """
                        export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
                        docker-compose -f $DOCKER_COMPOSE_FILE build --no-cache
                    """
                    echo "Docker image build complete."
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    sh """
                        export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
                        docker-compose -f $DOCKER_COMPOSE_FILE up -d
                    """
                }
            }
        }
        // stage('Robot Test') {
        //     steps {
        //         script {
        //             echo "Running Robot Framework tests..."
        //             // รัน Robot Framework โดยตรงบนเครื่อง Jenkins
        //             sh """
        //                 /opt/anaconda3/bin/robot --outputdir ${pwd()}/Robot/result ${pwd()}/Robot/script
        //             """
        //         }
        //     }
        //     post {
        //         always {
        //             // จัดเก็บผลการทดสอบเป็น artifacts
        //             archiveArtifacts artifacts: "${ROBOT_RESULTS_DIR}/**/*", fingerprint: true
                    
        //             robot outputPath: "${ROBOT_RESULTS_DIR}", 
        //                 passThreshold: 80.0, 
        //                 unstableThreshold: 60.0
        //         }
        //     }
        // }
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
