import express from "express";
import connect from "./schemas/index.js";
import TodosRouter from "./routes/todos.router.js";
import errorHandlerMiddleware from "./middlewares/error-handler.middleware.js";

// app 생성
const app = express();
const PORT = 3000;

// 데이터베이스 연결
connect();

// Body Parser 미들웨어, 이 두 가지는 같이 다님
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// assets 폴더에 있는 프론트엔드 정적 파일을 서빙하는 미들웨어
app.use(express.static("./assets"));

// 라우터를 생성
const router = express.Router();

router.get("/", (req, res) => {
  return res.json({ message: "Hi!" });
});

// 라우터에 접근할 수 있는 경로를 미들웨어로 설정
app.use("/api", [router, TodosRouter]);

// 에러 처리 미들웨어
// 미들웨어는 등록된 순서대로 실행되기 때문에, 에러 처리는 최하단에 위치
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
