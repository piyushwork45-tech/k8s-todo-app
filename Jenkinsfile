pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
        IMAGE_NAME = "piyush4536/todo-app"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/piyushwork45-tech/k8s-todo-app.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest ."
            }
        }

        stage('Push to Docker Hub') {
            steps {
                sh "echo ${DOCKERHUB_CREDENTIALS_PSW} | docker login -u ${DOCKERHUB_CREDENTIALS_USR} --password-stdin"
                sh "docker push ${IMAGE_NAME}:${IMAGE_TAG}"
                sh "docker push ${IMAGE_NAME}:latest"
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh "kubectl apply -f k8s/deployment.yaml"
                sh "kubectl apply -f k8s/service.yaml"
                sh "kubectl set image deployment/todo-app todo-app=${IMAGE_NAME}:${IMAGE_TAG}"
                sh "kubectl rollout status deployment/todo-app"
            }
        }
    }

    post {
        always {
            sh "docker logout"
        }
        success {
            mail to: 'piyush.work45@gmail.com',
                 subject: "✅ BUILD #${BUILD_NUMBER} SUCCESS — todo-app-pipeline",
                 body: """
Hello Piyush,

Build #${BUILD_NUMBER} successfully completed!

Job      : ${JOB_NAME}
Build    : #${BUILD_NUMBER}
Status   : SUCCESS
Image    : piyush4536/todo-app:${BUILD_NUMBER}
Live URL : http://192.168.174.128:30070

Check details: ${BUILD_URL}

— Jenkins
                 """
        }
        failure {
            mail to: 'piyush.work45@gmail.com',
                 subject: "❌ BUILD #${BUILD_NUMBER} FAILED — todo-app-pipeline",
                 body: """
Hello Piyush,

Build #${BUILD_NUMBER} FAILED!

Job      : ${JOB_NAME}
Build    : #${BUILD_NUMBER}
Status   : FAILED

Check console output for details:
${BUILD_URL}console

— Jenkins
                 """
        }
    }
}
