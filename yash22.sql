-- Step 1: Create Database
CREATE DATABASE schoool_db;
USE schoool_db;

-- Step 2: Create Students Table
CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(50),
    age INT,
    email VARCHAR(100)
);

-- Step 3: Create Courses Table
CREATE TABLE courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(50),
    duration_months INT
);

-- Step 4: Relationship (Foreign Key)
ALTER TABLE students
ADD COLUMN course_id INT,
ADD CONSTRAINT fk_course FOREIGN KEY (course_id) REFERENCES courses(course_id);

-- Step 5: Insert Sample Data
INSERT INTO courses (course_name, duration_months) VALUES
('Mathematics', 6),
('Computer Science', 12),
('Physics', 9);

INSERT INTO students (student_name, age, email, course_id) VALUES
('yash', 19, 'yash@example.com', 1),
('jayh', 22, 'jayh@example.com', 2),
('parth', 20, 'parth@example.com', 3),
('sarvesh', 21, 'sarvesh@example.com', 2),
('siddhesh', 23, 'siddhesh@example.com', 1);

-- Step 6: ALTER Commands
ALTER TABLE students ADD COLUMN phone_number VARCHAR(15);
ALTER TABLE courses CHANGE duration_months course_duration INT;
ALTER TABLE students DROP COLUMN email;

-- Step 7: Queries
-- a. Display all students and their course names
SELECT s.student_name, c.course_name
FROM students s
JOIN courses c ON s.course_id = c.course_id;

-- b. Display only students older than 20
SELECT * FROM students WHERE age > 20;

-- c. Count how many students are in each course
SELECT c.course_name, COUNT(s.student_id) AS num_students
FROM courses c
LEFT JOIN students s ON c.course_id = s.course_id
GROUP BY c.course_name;


-- e. Remove a student
DELETE FROM students WHERE student_name = 'jay';
