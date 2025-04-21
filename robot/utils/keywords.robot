*** Settings ***
Library           SeleniumLibrary
Library           OperatingSystem
Library           String
Library           DateTime
Library           Collections
Resource          variables.robot

*** Keywords ***
Reset To Home Page
    Go To    ${BASE_URL}
    Wait Until Page Contains Element    xpath=//*[@id="root"]/div/div/div[1]/h1[contains(text(), 'เลือกบทบาทของคุณ')]    timeout=2s

Clear Test Data
    # ล้างข้อมูลการทดสอบหรือปิดกล่องข้อความแจ้งเตือน
    ${alert_exists}=    Run Keyword And Return Status    Page Should Contain Element    xpath=//div[contains(@class, 'swal2-container')]
    Run Keyword If    ${alert_exists}    Click Element    xpath=//button[contains(text(), 'ตกลง')]


Wait To Screenshot
    [Arguments]    ${step_name}    ${wait_time}=1
    Sleep    ${wait_time}s
    # สร้างโฟลเดอร์ผลลัพธ์สำหรับแต่ละ test case
    ${folder_path}=    Set Variable    ../robot/result/screenshot/${TEST NAME}
    Create Directory    ${folder_path}
    # จับภาพหน้าจอด้วยชื่อไฟล์ที่มีความหมาย
    Capture Page Screenshot    ${folder_path}/${step_name}.png
    Log    จับภาพหน้าจอ ${step_name} สำหรับ ${TEST NAME} เรียบร้อย    console=True

Initialize Test Case
    [Arguments]    ${test_id}
    # สร้างโฟลเดอร์ผลลัพธ์สำหรับ test case นี้
    ${folder_path}=    Set Variable    ${OUTPUTDIR}/${test_id}
    Create Directory    ${folder_path}
    # เก็บ test id เป็นตัวแปร test variable
    Set Test Variable    ${TEST_ID}    ${test_id}
    Log    เริ่มทำการทดสอบ: ${TEST NAME} (${test_id})    console=True
    # จับภาพหน้าจอเริ่มต้น
    Wait To Screenshot    start_test    0

Capture Step
    [Arguments]    ${step_name}    ${wait_time}=1
    # จับภาพหน้าจอระหว่างการทดสอบด้วยชื่อขั้นตอน
    Wait To Screenshot    ${step_name}    ${wait_time}

Open Browser And Maximize
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Implicit Wait    ${WAIT_TIMEOUT}

Wait Until Page Contains Element And Click
    [Arguments]    ${locator}
    Wait Until Page Contains Element    ${locator}    ${WAIT_TIMEOUT}
    Click Element    ${locator}

Wait Until Element Is Visible And Click
    [Arguments]    ${locator}
    Wait Until Element Is Visible    ${locator}    ${WAIT_TIMEOUT}
    Click Element    ${locator}

Wait Until Element Is Visible And Input Text
    [Arguments]    ${locator}    ${text}
    Wait Until Element Is Visible    ${locator}    ${WAIT_TIMEOUT}
    Wait To Screenshot    1
    Input Text    ${locator}    ${text}

Wait Until Element Is Visible And Clear
    [Arguments]    ${locator}
    Wait Until Element Is Visible    ${locator}    ${WAIT_TIMEOUT}
    Wait To Screenshot    1
    Clear Element Text    ${locator}

Select Role
    [Arguments]    ${role}
    Run Keyword If    '${role}' == 'employee'    Wait Until Element Is Visible And Click    xpath=//div[contains(text(), 'พนักงาน')]/ancestor::div[contains(@class, 'cursor-pointer')]
    Run Keyword If    '${role}' == 'admin'    Wait Until Element Is Visible And Click    xpath=//div[contains(text(), 'ผู้ดูแล')]/ancestor::div[contains(@class, 'cursor-pointer')]
    Run Keyword If    '${role}' == 'super_admin'    Wait Until Element Is Visible And Click    xpath=//div[contains(text(), 'ผู้ดูแลระบบ')]/ancestor::div[contains(@class, 'cursor-pointer')]

Login
    [Arguments]    ${email}    ${password}    ${role}
    Open Browser And Maximize
    Select Role    ${role}
    Wait To Screenshot    1
    Wait Until Element Is Visible And Input Text    xpath=//input[@name="email"]    ${email}
    Wait To Screenshot    1
    Wait Until Element Is Visible And Input Text    xpath=//input[@name="password"]    ${password}
    Wait To Screenshot    1
    Wait Until Element Is Visible And Click    xpath=//button[contains(text(), 'เข้าสู่ระบบ')]
    Wait To Screenshot    1

Verify Login Failed
    [Arguments]    ${expected_error}
    Wait To Screenshot    1
    Wait Until Page Contains    ${expected_error}    ${WAIT_TIMEOUT}
    Wait To Screenshot    1

Accept Policy
    Wait Until Page Contains    นโยบายความเป็นส่วนตัว    ${WAIT_TIMEOUT}
    Wait To Screenshot    1
    Wait Until Element Is Visible And Click    xpath=//span[contains(text(), 'ยอมรับ')]
    Wait To Screenshot    1
    Wait Until Element Is Visible And Click    xpath=//button[contains(text(), 'ตกลง')]
    Wait To Screenshot    1


Input OTP
    Wait To Screenshot    1
    Wait Until Element Is Visible And Click    xpath=//button[contains(text(), 'ยืนยัน')]
    Wait To Screenshot    1


Verify Dashboard For Role
    [Arguments]    ${role}
    Run Keyword If    '${role}' == 'employee'    Verify Employee Dashboard
    Run Keyword If    '${role}' == 'admin'    Verify Admin Dashboard
    Run Keyword If    '${role}' == 'super_admin'    Verify Super Admin Dashboard

Verify Employee Dashboard
    Wait Until Page Contains Element    xpath=//div[contains(text(), 'ภาพรวมการอบรม')]    ${WAIT_TIMEOUT}
    Wait Until Page Contains Element    xpath=//div[contains(text(), 'หลักสูตรแนะนำ')]    ${WAIT_TIMEOUT}

Verify Admin Dashboard
    Wait Until Page Contains Element    xpath=//div[contains(text(), 'รายชื่อพนักงาน')]    ${WAIT_TIMEOUT}
    Wait Until Page Contains Element    xpath=//div[contains(text(), 'หลักสูตรฝึกอบรม')]    ${WAIT_TIMEOUT}

Verify Super Admin Dashboard
    Wait Until Page Contains Element    xpath=//div[contains(text(), 'รายชื่อพนักงาน')]    ${WAIT_TIMEOUT}
    Wait Until Page Contains Element    xpath=//div[contains(text(), 'ประวัติการเข้า-ออกระบบ')]    ${WAIT_TIMEOUT}

Logout
    Wait Until Element Is Visible And Click    xpath=//div[contains(@class, 'ant-dropdown-trigger')]
    Wait Until Element Is Visible And Click    xpath=//button[contains(text(), 'Logout')]
    Wait Until Page Contains Element    xpath=//div[contains(text(), 'พนักงาน')]/ancestor::div[contains(@class, 'cursor-pointer')]    ${WAIT_TIMEOUT}

View All Courses As Employee
    Wait Until Element Is Visible And Click    xpath=//button[contains(text(), 'หลักสูตรทั้งหมด')]
    Wait Until Page Contains    หลักสูตรทั้งหมด    ${WAIT_TIMEOUT}

Search Courses
    [Arguments]    ${search_text}
    Wait Until Element Is Visible And Input Text    xpath=//input[@placeholder='ค้นหาหลักสูตร']    ${search_text}

Register For Course
    [Arguments]    ${course_index}=1
    # เลือกคอร์สตาม index (1 คือคอร์สแรก)
    ${course_card}=    Set Variable    xpath=(//div[contains(@class, 'shadow-md')])[${course_index}]
    ${course_title}=    Get Text    ${course_card}//div[contains(@class, 'text-xl')]
    Wait Until Element Is Visible And Click    ${course_card}//button[contains(text(), 'ดูรายละเอียด')]
    
    # เลือกวันที่
    Wait Until Element Is Visible And Click    xpath=(//button[contains(@class, 'ant-btn') and not(contains(@class, 'ant-btn-dangerous'))])[1]
    
    # เลือกเวลา (เลือกช่วงเวลาแรกที่มี)
    Wait Until Element Is Visible And Click    xpath=(//button[contains(@class, 'ant-btn') and contains(text(), ':')])[1]
    
    # กดปุ่มลงทะเบียน
    Wait Until Element Is Visible And Click    xpath=//button[contains(text(), 'ลงทะเบียน')]
    Wait Until Page Contains    ลงทะเบียนสำเร็จ    ${WAIT_TIMEOUT}
    
    [Return]    ${course_title}

View Registered Courses
    Wait Until Element Is Visible And Click    xpath=//button[contains(text(), 'ดูทั้งหมด')]
    Wait Until Page Contains    หลักสูตรที่ลงทะเบียน    ${WAIT_TIMEOUT}

Create New User As Admin
    Wait Until Element Is Visible And Click    xpath=//button[contains(text(), 'เพิ่มผู้ใช้งาน')]
    
    # กรอกข้อมูลผู้ใช้ใหม่
    ${random_string}=    Generate Random String    5    [LOWER]
    ${email}=    Set Variable    test.${random_string}@example.com
    ${citizen_id}=    Generate Random String    13    [NUMBERS]
    
    Wait Until Element Is Visible And Input Text    xpath=//input[@name='email']    ${email}
    Wait Until Element Is Visible And Input Text    xpath=//input[@name='nationalId']    ${citizen_id}
    Wait Until Element Is Visible And Click    xpath=//div[@class='ant-select-selector']
    Wait Until Element Is Visible And Click    xpath=//div[contains(@class, 'ant-select-item') and contains(text(), 'นาย')]
    Wait Until Element Is Visible And Input Text    xpath=//input[@name='firstName']    Test
    Wait Until Element Is Visible And Input Text    xpath=//input[@name='lastName']    User
    Wait Until Element Is Visible And Input Text    xpath=//input[@name='phoneNumber']    0812345678
    
    # เลือกวันที่เริ่มงาน
    Click Element    xpath=//input[@name='startDate']
    Wait Until Element Is Visible And Click    xpath=//div[contains(@class, 'ant-picker-cell-today')]/div
    
    # เลือกแผนก
    Click Element    xpath=(//input[@id='departmentID'])[1]
    Wait Until Element Is Visible And Click    xpath=//div[contains(@class, 'ant-select-item') and @title='IT']
    
    # เลือก Role
    Wait Until Element Is Visible And Click    xpath=//input[@value='employee']
    
    # บันทึก
    Wait Until Element Is Visible And Click    xpath=//button[contains(text(), 'สร้างผู้ใช้')]
    Wait Until Page Contains    สร้างบัญชีผู้ใช้สำเร็จ    ${WAIT_TIMEOUT}
    
    [Return]    ${email}

Create New Course As Admin
    # คลิกที่แท็บหลักสูตรฝึกอบรม
    Wait Until Element Is Visible And Click    xpath=//div[contains(text(), 'หลักสูตรฝึกอบรม')]
    Wait Until Element Is Visible And Click    xpath=//button[contains(text(), 'เพิ่มหลักสูตร')]
    
    # กรอกข้อมูลหลักสูตร
    ${random_string}=    Generate Random String    5    [LOWER]
    ${course_name}=    Set Variable    Test Course ${random_string}
    
    # ชื่อหลักสูตร
    Wait Until Element Is Visible And Input Text    xpath=//input[@id='title']    ${course_name}
    
    # รายละเอียด
    Wait Until Element Is Visible And Input Text    xpath=//textarea[@id='description']    This is a test course description
    
    # วันเปิด/ปิดรับสมัคร
    ${today}=    Get Current Date    result_format=%Y-%m-%d
    ${next_month}=    Add Time To Date    ${today}    30 days    result_format=%Y-%m-%d
    
    Click Element    xpath=//input[contains(@id, 'dueDate_start')]
    Wait Until Element Is Visible And Click    xpath=//div[contains(@class, 'ant-picker-cell-today')]/div
    
    Click Element    xpath=//input[contains(@id, 'dueDate_end')]
    Wait Until Element Is Visible And Click    xpath=//div[contains(@class, 'ant-picker-cell') and @title='${next_month}']/div
    
    # เพิ่มตารางเรียน
    Wait Until Element Is Visible And Click    xpath=//button[@id='add_schedule']
    
    # เลือกวันที่
    ${schedule_date}=    Add Time To Date    ${today}    35 days    result_format=%Y-%m-%d
    Click Element    xpath=//input[contains(@id, 'schedule_0_date')]
    Wait Until Element Is Visible And Click    xpath=//div[contains(@class, 'ant-picker-cell') and @title='${schedule_date}']/div
    
    # เพิ่มช่วงเวลา
    Wait Until Element Is Visible And Click    xpath=//button[contains(text(), 'เพิ่มช่วงเวลา')]
    
    # เลือกเวลาเริ่ม
    Click Element    xpath=//input[contains(@id, 'schedule_0_times_0_start')]
    Wait Until Element Is Visible And Click    xpath=//div[contains(@class, 'ant-picker-time-panel-cell') and @title='9']
    Wait Until Element Is Visible And Click    xpath=//div[contains(@class, 'ant-picker-time-panel-cell') and @title='0']
    Wait Until Element Is Visible And Click    xpath=//button[contains(@class, 'ant-btn-primary') and contains(text(), 'OK')]
    
    # เลือกเวลาจบ
    Click Element    xpath=//input[contains(@id, 'schedule_0_times_0_end')]
    Wait Until Element Is Visible And Click    xpath=//div[contains(@class, 'ant-picker-time-panel-cell') and @title='12']
    Wait Until Element Is Visible And Click    xpath=//div[contains(@class, 'ant-picker-time-panel-cell') and @title='0']
    Wait Until Element Is Visible And Click    xpath=//button[contains(@class, 'ant-btn-primary') and contains(text(), 'OK')]
    
    # จำนวนที่นั่ง
    Wait Until Element Is Visible And Input Text    xpath=//input[contains(@id, 'schedule_0_times_0_seat')]    20
    
    # อาจาร์ยผู้สอน
    Wait Until Element Is Visible And Input Text    xpath=//input[contains(@id, 'instructors_0')]    Test Instructor
    
    # เลือกประเภทการอบรม
    Wait Until Element Is Visible And Click    xpath=//input[@value='online']
    
    # สถานที่อบรม
    Wait Until Element Is Visible And Input Text    xpath=//input[contains(@id, 'place_description')]    Online Zoom Meeting
    
    # บันทึกหลักสูตร
    Wait Until Element Is Visible And Click    xpath=//button[@id='btn_create_course']
    Wait Until Page Contains    สร้างหลักสูตรสำเร็จ    ${WAIT_TIMEOUT}
    
    [Return]    ${course_name}

View Course And Confirm Results
    [Arguments]    ${course_tab_index}=3
    # เลือกแท็บ "หลักสูตรที่จบแล้ว"
    Wait Until Element Is Visible And Click    xpath=//div[contains(@class, 'ant-tabs-tab')][${course_tab_index}]
    
    # เลือกหลักสูตรแรก
    Wait Until Element Is Visible And Click    xpath=(//tr[contains(@class, 'ant-table-row')])[1]
    
    # มาร์คผู้เข้าร่วมทุกคนเป็น "ผ่าน"
    ${participant_count}=    Get Element Count    xpath=//tbody/tr
    FOR    ${index}    IN RANGE    1    ${participant_count + 1}
        Wait Until Element Is Visible And Click    xpath=(//tbody/tr)[${index}]//span[contains(@class, 'ant-select-selection-item')]
        Wait Until Element Is Visible And Click    xpath=//div[contains(@class, 'ant-select-item') and contains(., 'ผ่าน')]
    END
    
    # ยืนยันผลการอบรม
    Wait Until Element Is Visible And Click    xpath=//button[contains(text(), 'ยืนยันผลการอบรม')]
    Wait Until Page Contains    ยืนยันผลการอบรมสำเร็จ    ${WAIT_TIMEOUT}