# ใช้ Node.js เป็น base image
FROM node:18

# ตั้ง working directory ภายใน container
WORKDIR /app

COPY package.json ./
RUN rm -rf node_modules
# ติดตั้ง dependencies ใหม่ด้วย yarn
RUN yarn

# คัดลอก source code ทั้งหมดจาก Client ไปที่ container
COPY . .

# เปิด port 5173 สำหรับ Vite dev server
EXPOSE 5173

# รัน dev server ด้วยคำสั่ง yarn
CMD ["yarn",  "dev"]
