*** Variables ***
${BROWSER}        Chrome
${BASE_URL}       http://localhost:5173
${OUTPUTDIR}    robot/result

${USERS_START_DATE}    2003-02-22     # วันที่เริ่มงานของพนักงานใช้วันเดียวกันหมด

#ข้อมูลใช้ทดสอบการสร้างบัญชีผู้ใช้ ค่าที่เป็นข้อมูล sensitive ดึงจาก .env
#EMP TEST DATA 
${EMP_EMAIL}    employee@example.com  # ค่าเริ่มต้น (จะถูกแทนที่ถ้ามีการส่งค่ามาจาก CLI)
${EMP_PASS}    0000000000000    # ค่าเริ่มต้น
${EMP_TITLE_NAME}    นางสาว
${EMP_FIRST_NAME}    Employee    # ค่าเริ่มต้น
${EMP_LAST_NAME}    Account    # ค่าเริ่มต้น
${EMP_ROLE}    employee
${EMP_PHONE}    0000000000    # ค่าเริ่มต้น
${EMP_DEPARTMENT}    67303d28feb812c5563e9960    # ค่าเริ่มต้น
${EMP_STATUS}    active

#ADMIN TEST DATA 
${ADMIN_EMAIL}    admin@example.com  # ค่าเริ่มต้น (จะถูกแทนที่ถ้ามีการส่งค่ามาจาก CLI)
${ADMIN_PASS}    0000000000000    # ค่าเริ่มต้น
${ADMIN_TITLE_NAME}    นางสาว
${ADMIN_FIRST_NAME}    Admin    # ค่าเริ่มต้น
${ADMIN_LAST_NAME}    Account    # ค่าเริ่มต้น
${ADMIN_ROLE}    admin
${ADMIN_PHONE}    0000000000    # ค่าเริ่มต้น
${ADMIN_DEPARTMENT}    67303d28feb812c5563e9960    # ค่าเริ่มต้น
${ADMIN_STATUS}    active    # กรณีสร้างด้วย admin ระบบจะต้องปรับเป็น inactive


#SUPER ADMIN TEST DATA 
${SA_EMAIL}    superadmin@example.com  # ค่าเริ่มต้น (จะถูกแทนที่ถ้ามีการส่งค่ามาจาก CLI)
${SA_PASS}    0000000000000    # ค่าเริ่มต้น
${SA_TITLE_NAME}    นางสาว
${SA_FIRST_NAME}    SA    # ค่าเริ่มต้น
${SA_LAST_NAME}    Account    # ค่าเริ่มต้น
${SA_ROLE}    super_admin
${SA_PHONE}    0000000000    # ค่าเริ่มต้น
${SA_DEPARTMENT}    67303d28feb812c5563e9960    # ค่าเริ่มต้น
${SA_STATUS}    active    



${WAIT_TIMEOUT}   30s
