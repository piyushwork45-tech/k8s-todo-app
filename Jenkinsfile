pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
        DISCORD_WEBHOOK = credentials('discord-webhook')
        IMAGE_NAME = "piyush4536/todo-app"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    def scmVars = checkout([
                        $class: 'GitSCM',
                        branches: [[name: '*/main']],
                        userRemoteConfigs: [[url: 'https://github.com/piyushwork45-tech/k8s-todo-app.git']]
                    ])
                    env.GIT_COMMIT_SHORT = scmVars.GIT_COMMIT.take(7)
                    env.GIT_AUTHOR = sh(script: "git log -1 --pretty=format:'%an'", returnStdout: true).trim()
                    env.GIT_MESSAGE = sh(script: "git log -1 --pretty=format:'%s'", returnStdout: true).trim()
                }
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
                script {
                    env.POD_STATUS = sh(script: "kubectl get pods -l app=todo-app --no-headers | awk '{print \$1\": \"\$2}' | paste -sd ',' -", returnStdout: true).trim()
                }
            }
        }
    }

    post {
        always {
            sh "docker logout"
            script {
                env.BUILD_DURATION = currentBuild.durationString.replace(' and counting', '')
            }
        }
        success {
            mail to: 'piyush.work45@gmail.com',
                 subject: "✅ BUILD #${BUILD_NUMBER} SUCCESS — todo-app-pipeline",
                 body: """
Hello Piyush,

Build #${BUILD_NUMBER} successfully completed!

Job        : ${JOB_NAME}
Build      : #${BUILD_NUMBER}
Status     : SUCCESS
Duration   : ${env.BUILD_DURATION}
Commit     : ${env.GIT_COMMIT_SHORT} by ${env.GIT_AUTHOR}
Message    : ${env.GIT_MESSAGE}
Image      : piyush4536/todo-app:${BUILD_NUMBER}
Live URL   : http://192.168.174.128:30070

Check details: ${BUILD_URL}

— Jenkins
                 """

            writeFile file: 'discord_payload.json', text: """{
  "embeds": [{
    "title": "Build #${BUILD_NUMBER} SUCCESS",
    "color": 3066993,
    "fields": [
      {"name": "Job", "value": "${JOB_NAME}", "inline": true},
      {"name": "Duration", "value": "${env.BUILD_DURATION}", "inline": true},
      {"name": "Image Tag", "value": "${BUILD_NUMBER}", "inline": true},
      {"name": "Author", "value": "${env.GIT_AUTHOR}", "inline": true},
      {"name": "Commit", "value": "${env.GIT_COMMIT_SHORT}", "inline": true},
      {"name": "Message", "value": "${env.GIT_MESSAGE}", "inline": false},
      {"name": "Live URL", "value": "http://192.168.174.128:30070", "inline": false},
      {"name": "Pods", "value": "${env.POD_STATUS}", "inline": false}
    ],
    "footer": {"text": "Jenkins CI/CD Pipeline"}
  }]
}"""
            sh 'curl -s -X POST "$DISCORD_WEBHOOK" -H "Content-Type: application/json" -d @discord_payload.json'
        }
        failure {
            mail to: 'piyush.work45@gmail.com',
                 subject: "❌ BUILD #${BUILD_NUMBER} FAILED — todo-app-pipeline",
                 body: """
Hello Piyush,

Build #${BUILD_NUMBER} FAILED!

Job        : ${JOB_NAME}
Build      : #${BUILD_NUMBER}
Duration   : ${env.BUILD_DURATION}
Commit     : ${env.GIT_COMMIT_SHORT} by ${env.GIT_AUTHOR}
Message    : ${env.GIT_MESSAGE}

Check console output:
${BUILD_URL}console

— Jenkins
                 """

            writeFile file: 'discord_payload.json', text: """{
  "embeds": [{
    "title": "Build #${BUILD_NUMBER} FAILED",
    "color": 15158332,
    "fields": [
      {"name": "Job", "value": "${JOB_NAME}", "inline": true},
      {"name": "Duration", "value": "${env.BUILD_DURATION}", "inline": true},
      {"name": "Author", "value": "${env.GIT_AUTHOR}", "inline": true},
      {"name": "Commit", "value": "${env.GIT_COMMIT_SHORT}", "inline": true},
      {"name": "Message", "value": "${env.GIT_MESSAGE}", "inline": false},
      {"name": "Check Logs", "value": "${BUILD_URL}console", "inline": false}
    ],
    "footer": {"text": "Jenkins CI/CD Pipeline"}
  }]
}"""
            sh 'curl -s -X POST "$DISCORD_WEBHOOK" -H "Content-Type: application/json" -d @discord_payload.json'
        }
    }
}
