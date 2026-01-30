# Internship Project – Social & Q&A Platform

**Live Demo:** https://internship-project-frontend-umber.vercel.app/

## Overview
This project is a full‑stack social interaction and Q&A platform developed as part of an internship assignment. The system combines a **public social space**, **StackOverflow‑like Q&A features**, **subscriptions**, **rewards**, **security controls**, and **multi‑language support**, with multiple business rules and constraints enforced at the application level.

The goal of the project is to demonstrate real‑world problem solving, backend logic enforcement, authentication/authorization workflows, payment integration, and scalable feature design.

---

## Core Features

### 1. Public Social Space
A shared public space where users can connect and interact.

**Capabilities**
- Users can upload **images and videos**.
- Users can **like, comment, and share** posts.
- Posting limits are based on the number of friends:
  - **0 friends** → Cannot post on the public page.
  - **1 post/day** → Default user.
  - **2 friends** → 2 posts/day.
  - **More than 10 friends** → Unlimited posts/day.

**Business Logic**
- Posting frequency is dynamically calculated based on the user’s friend count.
- All limits are validated server‑side.

---

### 2. Forgot Password & Password Generator
A secure password recovery mechanism.

**Rules & Flow**
- Users can request **Forgot Password only once per day**.
- Multiple requests in the same day trigger a **warning message**.
- Password reset can be requested using:
  - Email address, or
  - Phone number.

**Password Generator**
- Generates a **random password** automatically.
- Password constraints:
  - No numbers
  - No special characters
  - Combination of **uppercase and lowercase letters only**

---

### 3. Subscription & Payment System (Q&A Posting)
Subscription plans control how many questions a user can post per day.

**Plans**
| Plan | Price | Questions per Day |
|-----|------|------------------|
| Free | ₹0 | 1 |
| Bronze | ₹100/month | 5 |
| Silver | ₹300/month | 10 |
| Gold | ₹1000/month | Unlimited |

**Payment Rules**
- Integrated with a payment gateway (e.g., **Stripe / Razorpay**).
- Payments are allowed **only between 10:00 AM – 11:00 AM IST**.
- Any payment attempt outside this window is blocked.

**Post‑Payment Actions**
- An **email invoice** is automatically sent to the user.
- Email includes:
  - Plan name
  - Price
  - Validity
  - Transaction details

---

### 4. Reward System
A gamified reward mechanism to encourage user engagement.

**Points Allocation**
- Answering one question → **+5 points**
- Answer receives 5 upvotes → **+5 additional points**

**Point Management**
- Points are visible on the user’s profile.
- Points are **reduced automatically** if:
  - The answer is removed
  - The answer is taken down due to moderation/downtime

**Point Transfer**
- Users can transfer points to other users.
- Transfer conditions:
  - Minimum balance required: **10 points**
  - Users with less than 10 points **cannot transfer** points.
- Transfer flow:
  - Search user profile
  - Enter points to transfer
  - Confirm transfer

---

### 5. Multi‑Language Support
The platform supports full UI translation across multiple languages.

**Supported Languages**
- English
- Hindi
- Spanish
- Portuguese
- Chinese
- French

**Language Switch Authentication**
- Switching to **French**:
  - Email verification required
  - OTP sent to registered email
- Switching to other languages:
  - Mobile number verification
  - OTP sent to registered mobile number

**Scope**
- Entire website (all pages and components) is translated into the selected language.

---

### 6. User Login Tracking & Access Control
Advanced login tracking and conditional access rules.

**Tracked Data**
- Browser type (Chrome, Edge, etc.)
- Operating system
- Device type (Desktop / Laptop / Mobile)
- IP address

**Login History**
- Stored in the database
- Visible to the user in their profile as **Login History**

**Conditional Authentication Rules**
- **Google Chrome**:
  - Login requires OTP verification via email
- **Microsoft Browser (Edge)**:
  - Login allowed without additional authentication
- **Mobile Devices**:
  - Website access allowed **only between 10:00 AM – 1:00 PM**
  - Access is blocked outside this time window

---

## Technology Overview
- **Frontend:** Modern JavaScript framework (deployed on Vercel)
- **Backend:** API‑driven architecture with strict business rule enforcement
- **Authentication:** OTP‑based (Email & Mobile)
- **Payments:** Stripe / Razorpay integration
- **Database:** Stores users, posts, subscriptions, rewards, login history
- **Deployment:** Vercel (Frontend)

---

## Project Status
- Core features implemented as per internship requirements
- Some advanced modules marked as **Pending** during evaluation phase
- Designed to be scalable and production‑ready

---

## Purpose
This project was built to demonstrate:
- Real‑world backend logic implementation
- Secure authentication and authorization flows
- Payment system constraints
- Gamification through reward systems
- Internationalization (i18n)
- Device‑ and browser‑based access control

---

## Author
**Internship Project**  
Developed as part of an internship assignment to showcase full‑stack development skills.

