# Internship Project – Social & Q&A Platform

### 🚀 Visit Link: [QueryNest Live](https://internship-project-frontend-umber.vercel.app/)

## Overview
This project is a full-stack social interaction and Q&A platform developed as part of an internship assignment. The system combines a **public social space**, **StackOverflow-like Q&A features**, **subscriptions**, **rewards**, **security controls**, and **multi-language support**, with multiple business rules and constraints enforced at the application level.

The objective of this project is to demonstrate real-world problem solving, backend business-logic enforcement, authentication and authorization workflows, payment integration, and scalable feature design.

---

## Core Features

### 1. Public Social Space
A shared public space where users can connect and interact.

**Capabilities**
- Users can upload **images and videos**
- Users can **like, comment, and share** posts
- Posting limits based on friend count:
  - **0 friends** → Cannot post on the public page
  - **Default user** → 1 post/day
  - **2 friends** → 2 posts/day
  - **More than 10 friends** → Unlimited posts/day

**Business Logic**
- Posting limits are dynamically calculated using the user’s friend count
- All constraints are validated server-side

---

### 2. Forgot Password & Password Generator
A secure password recovery mechanism.

**Rules & Flow**
- Forgot Password can be requested **only once per day**
- Multiple attempts on the same day trigger a **warning message**
- Reset can be requested using:
  - Email address, or
  - Phone number

**Password Generator**
- Automatically generates a **random password**
- Constraints:
  - No numbers
  - No special characters
  - Only **uppercase and lowercase letters**

---

### 3. Subscription & Payment System (Q&A Posting)

| Plan | Price | Questions / Day |
|-----|------|----------------|
| Free | ₹0 | 1 |
| Bronze | ₹100/month | 5 |
| Silver | ₹300/month | 10 |
| Gold | ₹1000/month | Unlimited |

**Payment Rules**
- Integrated with **Stripe / Razorpay**
- Payments allowed **only between 10:00 AM – 11:00 AM IST**
- Attempts outside this window are blocked

**Post-Payment Actions**
- Automatic **email invoice**
- Includes:
  - Plan name
  - Price
  - Validity
  - Transaction details

---

### 4. Reward System

**Points Allocation**
- Answering a question → **+5 points**
- 5 upvotes on an answer → **+5 additional points**

**Point Management**
- Points visible on user profile
- Points are **automatically reduced** if:
  - Answer is deleted
  - Answer is removed due to moderation or downtime

**Point Transfer**
- Minimum balance required: **10 points**
- Transfer flow:
  - Search user profile
  - Enter points
  - Confirm transfer

---

### 5. Multi-Language Support

**Supported Languages**
- English
- Hindi
- Spanish
- Portuguese
- Chinese
- French

**Language Switch Verification**
- **French** → Email OTP verification
- **Other languages** → Mobile OTP verification

**Scope**
- Entire application UI is translated

---

### 6. User Login Tracking & Access Control

**Tracked Information**
- Browser type
- Operating system
- Device type
- IP address

**Login History**
- Stored in database
- Visible in user profile

**Conditional Rules**
- **Google Chrome** → Email OTP required
- **Microsoft Edge** → Direct login allowed
- **Mobile devices** → Access allowed only **10:00 AM – 1:00 PM**

---

## Technology Stack
- **Frontend:** Modern JavaScript framework (Vercel)
- **Backend:** API-based architecture with strict rule enforcement
- **Authentication:** OTP (Email & Mobile)
- **Payments:** Stripe
- **Database:** Users, posts, subscriptions, rewards, login history

---

## Project Status
✅ **All features fully implemented and completed**  
✅ Business rules enforced as per requirements   

---

## Purpose
This project demonstrates:
- Real-world backend logic
- Secure authentication workflows
- Payment constraints
- Gamification systems
- Internationalization (i18n)
- Device and browser-based access control

---

## Author
**Internship Project**  
Developed as part of an internship assignment to showcase full-stack development skills.
