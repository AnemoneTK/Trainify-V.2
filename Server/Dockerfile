# ใช้ Node เวอร์ชัน 18
FROM node:18

WORKDIR /app

# ติดตั้ง dependencies
COPY package*.json ./
RUN yarn install

# ติดตั้ง nodemon และ ts-node สำหรับโหมดพัฒนา
RUN yarn add -D ts-node nodemon

# คัดลอกโค้ดทั้งหมดไปยังคอนเทนเนอร์
COPY . .

# เปิดพอร์ตที่เซิร์ฟเวอร์จะใช้
ENV PORT=3000
EXPOSE 3000

# รันในโหมดพัฒนาโดยใช้ nodemon ชี้ไปที่ไฟล์ server.ts ใน src
CMD ["yarn", "dev"]
