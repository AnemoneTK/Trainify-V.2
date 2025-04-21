*** Settings ***
Documentation     Robot Framework test suite for Trainify application
Resource          ../utils/keywords.robot
Resource          ../utils/variables.robot

Suite Setup       Open Browser And Maximize
Suite Teardown    Close All Browsers
Test Setup        Reset To Home Page
Test Teardown     Clear Test Data

*** Test Cases ***
TC-10 Login With Wrong Format Email
    [Documentation]    ทดสอบการเข้าสู่ระบบโดยกรอกรูปแบบ Email ผิด
    Initialize Test Case    TC-10
    Wait Until Page Contains Element    xpath=//*[@id="root"]/div/div/div[1]/h1[contains(text(), 'เลือกบทบาทของคุณ')]    ${10}
    Page Should Contain Element    xpath=//*[@id="root"]/div/div/div[2]/div[3]/span[contains(text(), 'ผู้ดูแลระบบ')]
    Capture Step    Select_Role
    Click Element    xpath=//*[@id="root"]/div/div/div[2]/div[3]/span[contains(text(), 'ผู้ดูแลระบบ')]
    Capture Step    Super_Admin_Login_Page
    Input Text    id=login_email    email.com
    Capture Step    Input_Wrong_Format_Email
    Input Password    id=login_password    ${SA_PASS}
    Capture Step    Input_Password
    Click Button    xpath=//*[@id="login"]/div[3]/div/div/div/div/button[contains(text(), 'เข้าสู่ระบบ')]
    Wait Until Page Contains   กรุณากรอกอีเมลที่ถูกต้อง   timeout=10s
    Capture Step    After_Submit

TC-05 Login With Wrong Email
    [Documentation]    ทดสอบการเข้าสู่ระบบโดยกรอกอีเมลผิดหรืออีเมลที่ยังไม่มีในระบบ
    Initialize Test Case    TC-05
    Wait Until Page Contains Element    xpath=//*[@id="root"]/div/div/div[1]/h1[contains(text(), 'เลือกบทบาทของคุณ')]    ${10}
    Capture Step    Select_Role
    Click Element    xpath=//*[@id="root"]/div/div/div[2]/div[3]/span[contains(text(), 'ผู้ดูแลระบบ')]
    Wait Until Page Contains    ผู้ดูแลระบบ    timeout=10s
    Capture Step    Super_Admin_Login_Page
    Input Text    id=login_email     narisara.hun@gmail.com
    Capture Step    Input_Wrong_Email
    Input Password    id=login_password    123456789
    Capture Step    Input_Password
    Click Button    xpath=//*[@id="login"]/div[3]/div/div/div/div/button[contains(text(), 'เข้าสู่ระบบ')]
    Wait Until Page Contains    ไม่พบบัญชีผู้ใช้    timeout=10s
    Capture Step    After_Submit
    Click Button    xpath=/html/body/div[2]/div/div[6]/button[1][contains(text(), 'ตกลง')]
    Capture Step    Close_Alert

TC-06 Login With Wrong Password
    [Documentation]    ทดสอบการเข้าสู่ระบบโดยกรอกรหัสผ่านผิด
    Initialize Test Case    TC-06
    Wait Until Page Contains Element    xpath=//*[@id="root"]/div/div/div[1]/h1[contains(text(), 'เลือกบทบาทของคุณ')]     ${10}
    Page Should Contain Element    xpath=//*[@id="root"]/div/div/div[2]/div[3]/span[contains(text(), 'ผู้ดูแลระบบ')]
    Capture Step    Select_Role
    Click Element    xpath=//*[@id="root"]/div/div/div[2]/div[3]/span[contains(text(), 'ผู้ดูแลระบบ')]
    Capture Step    Super_Admin_Login_Page
    Input Text    id=login_email     ${SA_EMAIL}
    Capture Step    Input_Wrong_Format_Email
    Input Password    id=login_password    123456789
    Capture Step    Input_Password
    Click Button    xpath=//*[@id="login"]/div[3]/div/div/div/div/button[contains(text(), 'เข้าสู่ระบบ')]
    Wait Until Page Contains    รหัสผ่านไม่ถูกต้อง    timeout=10s
    Capture Step    After_Submit
    Click Button    xpath=/html/body/div[2]/div/div[6]/button[1][contains(text(), 'ตกลง')]
    Capture Step    Close_Alert

TC-03 Login With Super Admin Account
    [Documentation]    ทดสอบการเข้าสู่ระบบผู้ดูแลระบบเพื่อเข้าหน้า OTP
    Initialize Test Case    TC-03
    Wait Until Page Contains Element    xpath=//*[@id="root"]/div/div/div[1]/h1[contains(text(), 'เลือกบทบาทของคุณ')]    ${10}
    Page Should Contain Element    xpath=//*[@id="root"]/div/div/div[2]/div[3]/span[contains(text(), 'ผู้ดูแลระบบ')]
    Capture Step    Select_Role
    Click Element    xpath=//*[@id="root"]/div/div/div[2]/div[3]/span[contains(text(), 'ผู้ดูแลระบบ')]
    Capture Step    Super_Admin_Login_Page
    Input Text    id=login_email     ${SA_EMAIL}
    Capture Step    Input__Email
    Input Password    id=login_password    ${SA_PASS}
    Capture Step    Input_Password
    Click Button    xpath=//*[@id="login"]/div[3]/div/div/div/div/button[contains(text(), 'เข้าสู่ระบบ')]
    Page Should Contain Element    xpath=//*[@id="root"]/div/div/div[1][contains(text(), 'ยืนยันรหัส OTP')]
    Capture Step    After_Submit

TC-07 Wrong OTP
    [Documentation]    ทดสอบการใส่ OTP ผิด
    Initialize Test Case    TC-07
    Wait Until Page Contains Element    xpath=//*[@id="root"]/div/div/div[1]/h1[contains(text(), 'เลือกบทบาทของคุณ')]    ${10}
    Page Should Contain Element    xpath=//*[@id="root"]/div/div/div[2]/div[3]/span[contains(text(), 'ผู้ดูแลระบบ')]
    Click Element    xpath=//*[@id="root"]/div/div/div[2]/div[3]/span[contains(text(), 'ผู้ดูแลระบบ')]
    Input Text    id=login_email     ${SA_EMAIL}
    Input Password    id=login_password    ${SA_PASS}
    Click Button    xpath=//*[@id="login"]/div[3]/div/div/div/div/button[contains(text(), 'เข้าสู่ระบบ')]
    Capture Step    After_Submit
    Wait Until Page Contains    ยืนยันรหัส OTP   timeout=10s
    Capture Step    OTP_Verify_Page
    Wait Until Element Is Enabled   xpath=//*[@id="root"]/div/div/div[4]/button     20s
    Capture Step    Input_Wrong_OTP
    Click Button    xpath=//*[@id="root"]/div/div/div[4]/button
    Wait Until Page Contains    OTP ไม่ถูกต้อง    timeout=2s
    Capture Step    After_Submit
    Click Button    xpath=/html/body/div[2]/div/div[6]/button[1][contains(text(), 'ตกลง')]
    Capture Step    Close_Alert

TC-09 Verify OTP
    [Documentation]    ทดสอบการใส่ OTP เพื่อเข้าสู่ระบบ
    Initialize Test Case    TC-09
    Wait Until Page Contains Element    xpath=//*[@id="root"]/div/div/div[1]/h1[contains(text(), 'เลือกบทบาทของคุณ')]     ${10}
    Page Should Contain Element    xpath=//*[@id="root"]/div/div/div[2]/div[3]/span[contains(text(), 'ผู้ดูแลระบบ')]
    Click Element    xpath=//*[@id="root"]/div/div/div[2]/div[3]/span[contains(text(), 'ผู้ดูแลระบบ')]
    Input Text    id=login_email     ${SA_EMAIL}
    Input Password    id=login_password    ${SA_PASS}
    Click Button    xpath=//*[@id="login"]/div[3]/div/div/div/div/button[contains(text(), 'เข้าสู่ระบบ')]
    Capture Step    After_Submit
    Wait Until Page Contains    ยืนยันรหัส OTP   timeout=10s
    Capture Step    OTP_Verify_Page
    Wait Until Element Is Enabled   xpath=//*[@id="root"]/div/div/div[4]/button     20s
    Capture Step    Input_OTP
    Click Button    xpath=//*[@id="root"]/div/div/div[4]/button
    Wait Until Page Contains   Trainify : Super Admin    timeout=2s
    Capture Step    Super_Admin_Dashboard


# TC-02 Create Admin Account
#     [Documentation]    ทดสอบการสร้างบัญชีผู้ใช้
#     Initialize Test Case    TC-02
#     Wait Until Page Contains Element    xpath=//*[@id="root"]/div/div/div[1]/h1[contains(text(), 'เลือกบทบาทของคุณ')]    ${10}
#     Page Should Contain Element    xpath=//*[@id="root"]/div/div/div[2]/div[3]/span[contains(text(), 'ผู้ดูแลระบบ')]
#     Click Element    xpath=//*[@id="root"]/div/div/div[2]/div[3]/span[contains(text(), 'ผู้ดูแลระบบ')]
#     Page Should Contain Element    xpath=//*[@id="root"]/div/div/div[2]/h1/span[contains(text(), 'ผู้ดูแลระบบ')]
#     Capture Step    Input_Email
#     Input Password    id=login_password    ${SA_PASS}
#     Click Button    xpath=//*[@id="login"]/div[3]/div/div/div/div/button[contains(text(), 'เข้าสู่ระบบ')]
#     Page Should Contain Element    xpath=//*[@id="root"]/div/div/div[1][contains(text(), 'ยืนยันรหัส OTP')]
#     Capture Step    After_Submit

