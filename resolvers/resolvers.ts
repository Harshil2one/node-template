const students = [
  {
    id: 1,
    name: "Test 1",
    email: "test1@yopmail.com",
    password: "Test@123",
    collegeId: 1325,
  },
  {
    id: 2,
    name: "Test 2",
    email: "test2@yopmail.com",
    password: "Test@123",
    collegeId: 1332,
  },
  {
    id: 3,
    name: "Test 3",
    email: "test3@yopmail.com",
    password: "Test@123",
    collegeId: 1335,
  },
  {
    id: 4,
    name: "Test 4",
    email: "test4@yopmail.com",
    password: "Test@123",
    collegeId: 1332,
  },
  {
    id: 5,
    name: "Test 5",
    email: "test5@yopmail.com",
    password: "Test@123",
    collegeId: 1382,
  },
];

const colleges = [
  { id: 1325, name: "AMITY", location: "Delhi", rating: 9.4 },
  { id: 1332, name: "RK", location: "Rajkot", rating: 8.1 },
  { id: 1335, name: "Government", location: "Patan", rating: 8 },
  { id: 1382, name: "Atmiya", location: "Rajkot", rating: 7.2 },
];

console.time("test");

export default {
  Query: {
    authenticate: (_root: any, _args: any, context: any) => {
      if(!context.user) {
        throw new Error("Unauthorized");
      }
      return `Hi ${context.user.name}, You are authorized.`
    },
    students: () => students,
    colleges: () => colleges,
    sayHello: (_root: any, args: any, _context: any, _info: any) =>
      `Hello ${args.name}, Welcome.`,
    setFavouriteColor: (_root: any, args: any) => {
      return "Your Fav Color is : " + args.color;
    },
    cachedStudents: () => students, // caching is only done by frontend, using cache:new InMemoryCache()
    getTime:() => {
      const today = new Date();
      var h = today.getHours();
      var m = today.getMinutes();
      var s = today.getSeconds();
      return `${h}:${m}:${s}`;
    },
  },
  Mutation: {
    createStudent: (_root: any, args: any) => {
      const { name, email, password, collegeId } = args;
      if(email.length < 10) {
        throw new Error("Email is invalid")
      }
      return students.push({
        id: Math.floor(Math.random() * 10),
        name,
        email,
        password,
        collegeId,
      });
    },
  },
  Students: {
    college: (student: any) => {
      return colleges.find((college) => college.id === student.collegeId);
    },
    bio: (student: any) => {
      return `Contact me on ${student.email}. Colleged from - ${
        colleges.find((college) => college.id === student.collegeId)?.name
      }.`;
    },
  },
};

console.timeEnd("test");