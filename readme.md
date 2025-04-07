# Future blink backend assignment

A backend service to create, manage, and schedule cold email flows using Node.js, Express, TypeScript, Agenda, and Prisma.

---

## 🚀 Features

- Create and store custom email flow charts
- Parse uploaded CSV leads
- Schedule emails using `Agenda`
- Email delivery with `Nodemailer`
- Auth via signed cookies
- TypeScript-based with Prisma ORM and MongoDB

---

## 🛠 Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/renji18/future_blink_assignment_backend
cd future_blink_assignment_backend
```

Install the dependencies
```bash
npm install
```

### Create a .env file

```bash
PORT=3000
DATABASE_URL=your_mongodb_or_postgres_url
FUTURE_BLINK_TOKEN_KEY=your_jwt_secret
EMAIL_USER=your@email.com
EMAIL_PASS=your_password
```


### Generate Prisma Client
```bash
npx prisma generate
```

### build and start
```bash
npm run build
npm start
```