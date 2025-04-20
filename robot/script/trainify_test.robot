*** Settings ***
Documentation     Robot Framework test suite for Trainify application
Resource          ../utils/keywords.robot
Resource          ../utils/variables.robot

Suite Setup       Open Browser And Maximize
Suite Teardown    Close All Browsers

*** Test Cases ***
TC-05 Super Admin Login Success
    [Documentation]    ทดสอบการเข้าสู่ระบบโดยกรอกรูปแบบ Email ผิด
    Initialize Test Case    TC-05
    Wait Until Page Contains Element    xpath=//*[@id="root"]/div/div/div[1]/h1[contains(text(), 'เลือกบทบาทของคุณ')]    ${1}
    Page Should Contain Element    xpath=//*[@id="root"]/div/div/div[2]/div[3]/span[contains(text(), 'ผู้ดูแลระบบ')]
    Capture Step    Select_Role
    Click Element    xpath=//*[@id="root"]/div/div/div[2]/div[3]/span[contains(text(), 'ผู้ดูแลระบบ')]
    Page Should Contain Element    xpath=//*[@id="root"]/div/div/div[2]/h1/span[contains(text(), 'ผู้ดูแลระบบ')]
    Capture Step    Super_Admin_Login_Page
    Input Text    id=login_email    email.com
    Capture Step    Input_Wrong_Format_Email
    Input Password    id=login_password    ${SA_PASS}
    Capture Step    Input_Password
    Click Button    xpath=//*[@id="login"]/div[3]/div/div/div/div/button[contains(text(), 'เข้าสู่ระบบ')]
    Page Should Contain Element    xpath=//*[@id="login_email_help"]/div[contains(text(), 'กรุณากรอกอีเมลที่ถูกต้อง!')]
    Capture Step    After_Submit

TC-01 Super Admin Login Success
    [Documentation]    ทดสอบการเข้าสู่ระบบของผู้ดูแลระบบ
    Initialize Test Case    TC-01
    Wait Until Page Contains Element    xpath=//*[@id="root"]/div/div/div[1]/h1[contains(text(), 'เลือกบทบาทของคุณ')]    ${1}
    Page Should Contain Element    xpath=//*[@id="root"]/div/div/div[2]/div[3]/span[contains(text(), 'ผู้ดูแลระบบ')]
    Capture Step    Select_Role
    Click Element    xpath=//*[@id="root"]/div/div/div[2]/div[3]/span[contains(text(), 'ผู้ดูแลระบบ')]
    Page Should Contain Element    xpath=//*[@id="root"]/div/div/div[2]/h1/span[contains(text(), 'ผู้ดูแลระบบ')]
    Capture Step    Super_Admin_Login_Page
    Input Text    id=login_email    ${SA_EMAIL}
    Capture Step    Input_Email
    Input Password    id=login_password    ${SA_PASS}
    Capture Step    Input_Password
    Click Button    xpath=//*[@id="login"]/div[3]/div/div/div/div/button[contains(text(), 'เข้าสู่ระบบ')]
    Page Should Contain Element    xpath=//*[@id="root"]/div/div/div[1][contains(text(), 'ยืนยันรหัส OTP')]
    Capture Step    After_Submit



TC-07 Create Admin Account
    [Documentation]    ทดสอบการสร้างบัญชีผู้ใช้
    Initialize Test Case    TC-002
    Wait Until Page Contains Element    xpath=//*[@id="root"]/div/div/div[1]/h1[contains(text(), 'เลือกบทบาทของคุณ')]    ${1}
    Page Should Contain Element    xpath=//*[@id="root"]/div/div/div[2]/div[3]/span[contains(text(), 'ผู้ดูแลระบบ')]
    Click Element    xpath=//*[@id="root"]/div/div/div[2]/div[3]/span[contains(text(), 'ผู้ดูแลระบบ')]
    Page Should Contain Element    xpath=//*[@id="root"]/div/div/div[2]/h1/span[contains(text(), 'ผู้ดูแลระบบ')]
    Capture Step    Input_Email
    Input Password    id=login_password    ${SA_PASS}
    Click Button    xpath=//*[@id="login"]/div[3]/div/div/div/div/button[contains(text(), 'เข้าสู่ระบบ')]
    Page Should Contain Element    xpath=//*[@id="root"]/div/div/div[1][contains(text(), 'ยืนยันรหัส OTP')]
    Capture Step    After_Submit

# TC-002 Login As Employee With Valid Credentials
#     [Documentation]    ทดสอบการเข้าสู่ระบบด้วยบัญชีพนักงานที่ถูกต้อง
#     Login    ${EMP_EMAIL}    ${EMP_PASS}    ${EMP_ROLE}
#     Input OTP
#     Verify Dashboard For Role    ${EMP_ROLE}
#     Logout

# TC-003 Login As Admin With Valid Credentials
#     [Documentation]    ทดสอบการเข้าสู่ระบบด้วยบัญชีผู้ดูแลที่ถูกต้อง
#     Login    ${VALID_ADMIN_EMAIL}    ${VALID_PASSWORD}    admin
#     Input OTP    ${OTP_CODE}
#     Verify Dashboard For Role    admin
#     Logout

# TC-004 Login As Super Admin With Valid Credentials
#     [Documentation]    ทดสอบการเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบที่ถูกต้อง
#     Login    ${VALID_SUPER_ADMIN_EMAIL}    ${VALID_PASSWORD}    super_admin
#     Input OTP    ${OTP_CODE}
#     Verify Dashboard For Role    super_admin
#     Logout

# TC-005 Login With Invalid Email
#     [Documentation]    ทดสอบการเข้าสู่ระบบด้วยอีเมลที่ไม่ถูกต้อง
#     Login    ${INVALID_EMAIL}    ${VALID_PASSWORD}    employee
#     Verify Login Failed    ไม่พบบัญชีผู้ใช้

# TC-006 Login With Invalid Password
#     [Documentation]    ทดสอบการเข้าสู่ระบบด้วยรหัสผ่านที่ไม่ถูกต้อง
#     Login    ${EMP_EMAIL}    ${INVALID_PASSWORD}    employee
#     Verify Login Failed    รหัสผ่านไม่ถูกต้อง

# TC-007 View All Courses And Search
#     [Documentation]    ทดสอบการดูรายการหลักสูตรทั้งหมดและค้นหา
#     Login    ${EMP_EMAIL}    ${VALID_PASSWORD}    employee
#     Input OTP    ${OTP_CODE}
#     View All Courses As Employee
#     Search Courses    Python
#     # ตรวจสอบผลการค้นหา (ปรับตามข้อมูลจริง)
#     Wait Until Page Does Not Contain Element    xpath=//div[contains(text(), 'Java')]    timeout=3s
#     Logout

# TC-008 Register For Course
#     [Documentation]    ทดสอบการลงทะเบียนหลักสูตร
#     Login    ${EMP_EMAIL}    ${VALID_PASSWORD}    employee
#     Input OTP    ${OTP_CODE}
#     View All Courses As Employee
#     ${course_title}=    Register For Course
#     View Registered Courses
#     # ตรวจสอบว่าคอร์สที่ลงทะเบียนปรากฏในรายการ
#     Page Should Contain Element    xpath=//span[contains(text(), '${course_title}')]
#     Logout

# TC-009 Create New User As Admin
#     [Documentation]    ทดสอบการสร้างผู้ใช้ใหม่โดยผู้ดูแล
#     Login    ${VALID_ADMIN_EMAIL}    ${VALID_PASSWORD}    admin
#     Input OTP    ${OTP_CODE}
#     ${new_user_email}=    Create New User As Admin
#     # ตรวจสอบว่าผู้ใช้ใหม่ปรากฏในรายการ
#     Search Courses    ${new_user_email}
#     Page Should Contain Element    xpath=//td[contains(text(), '${new_user_email}')]
#     Logout

# TC-010 Create New Course As Admin
#     [Documentation]    ทดสอบการสร้างหลักสูตรใหม่โดยผู้ดูแล
#     Login    ${VALID_ADMIN_EMAIL}    ${VALID_PASSWORD}    admin
#     Input OTP    ${OTP_CODE}
#     ${course_name}=    Create New Course As Admin
#     # ตรวจสอบว่าหลักสูตรใหม่ปรากฏในรายการ
#     Search Courses    ${course_name}
#     Page Should Contain Element    xpath=//td[contains(text(), '${course_name}')]
#     Logout

# TC-011 Confirm Course Results
#     [Documentation]    ทดสอบการยืนยันผลการอบรม
#     Login    ${VALID_ADMIN_EMAIL}    ${VALID_PASSWORD}    admin
#     Input OTP    ${OTP_CODE}
#     View Course And Confirm Results
#     Logout