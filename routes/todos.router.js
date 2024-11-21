// /routes/todos.router.js
import express from "express";
import joi from "joi";
import Todo from "../schemas/todo.schema.js";

const router = express.Router();
// 유효성 검증
const createdTodoSchema = joi.object({
  value: joi.string().min(1).max(50).required(),
});

/* 할일 목록 추가하기 API */
router.post("/todos", async (req, res, next) => {
  try {
    // 1. 클라이언트에게 전달받은 value 데이터를 변수에 저장합니다.
    // const { value } = req.body;

    const validation = await createdTodoSchema.validateAsync(req.body);
    const { value } = validation;

    // 1-1) 유효성검사: 전달받을 value가 존재하지 않을 때, 클라이언트에게 에러 메시지를 응답하고 로직을 중단한다.
    if (!value) {
      return res
        .status(400)
        .json({ errorMessage: "해야할 일 데이터(value)가 존재하지 않습니다." });
    }

    // 2. 해당하는 마지막 order 데이터를 조회한다.
    // findOne은 1개의 데이터만 조회하는 메서드
    // sort(컬럼명) : 그 컬럼을 정렬함. 기본은 오름차순, "-"를 붙이면 내림차순
    const todoMaxOrder = await Todo.findOne().sort("-order").exec();

    // 3. 데이터가 존재한다면 그 다음 순서에 넣고, 존재하지 않는다면 1번 순서로 넣는다.
    const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;

    // 4. Todo모델을 이용해, 순서 로직이 적용된 새로운 '해야할 일'을 생성합니다.
    const todo = new Todo({ value, order });

    // 5. 생성한 '해야할 일'을 MongoDB에 저장합니다.
    await todo.save();

    // 6. '해야할 일'을 클라이언트에게 응답한다.
    return res.status(201).json({ todo });
  } catch (error) {
    next(error);
  }
});

/* 할일 목록 조회하기 API */
router.get("/todos", async (req, res) => {
  // 1. 해야할 일 목록 조회를 진행한다.
  // find는 여러 개를 조회하는 메서드
  const todos = await Todo.find().sort("-order").exec();
  // 2. 해야할 일 목록 조회 결과를 클라이언트에게 응답한다
  return res.status(200).json({ todos });
});

/* 할 일 목록 수정하기 */
// 어떤 '해야할 일'을 수정할지 알아야 하므로 경로 매개변수
router.patch("/todos/:todoId", async (req, res) => {
  // 1. 변경할 '해야할 일'의 ID 값을 가져옵니다.
  const { todoId } = req.params;
  // 2. '해야할 일'을 몇번째 순서로 설정할 지 order 값을 가져옵니다.
  // 1. 할 일 완료 여부를 판단하는 done 값을 가져옵니다.
  const { value, order, done } = req.body;

  // 3. 변경하려는 '해야할 일'을 가져옵니다.
  const currentTodo = await Todo.findById(todoId).exec();
  // 3-1) 유효성검사 : 만약 해당 ID값을 가진 '해야할 일'이 없다면 에러를 발생시킵니다.
  if (!currentTodo) {
    return res
      .status(404)
      .json({ errorMessage: "존재하지 않는 todo 데이터입니다." });
  }

  // 4. 변경하려는 order 값을 가지고 있는 '해야할 일'을 찾습니다.
  if (order) {
    const targetTodo = await Todo.findOne({ order }).sort("-order").exec();
    // 4-1) 만약, 이미 해당 order 값을 가진 '해야할 일'이 있다면
    if (targetTodo) {
      // 4-2) 해당 '해야할 일'의 order 값을 변경하고 저장합니다.
      targetTodo.order = currentTodo.order;
      await targetTodo.save();
    }
    // 5. 변경하려는 '해야할 일'의 order 값을 변경합니니다.
    currentTodo.order = order;
  }

  // 2. 할 일 완료 표시를 null로 하기 때문에 null은 조건에서 제외해줘야함
  if (done !== undefined) {
    currentTodo.doneAt = done ? new Date() : null;
  }

  if (value) {
    currentTodo.value = value;
  }

  // 6. 변경된 '해야할 일'을 저장합니다.
  await currentTodo.save();

  return res.status(200).json({});
});

/* 할 일 목록 삭제하기 */
router.delete("/todos/:todoId", async (req, res) => {
  console.log(req.params);
  // 1. 삭제할 '해야할 일'의 ID를 경로 매개변수에서 받아옵니다.
  const { todoId } = req.params;
  // 2. 받아온 ID를 통해 데이터베이스에서 삭제할 "해야할 일"을 찾습니다.
  console.log(todoId);
  const todo = await Todo.findById(todoId).exec();
  console.log(todo);
  // 2-1) 만약 일치하는 '해야할 일'이 없다면, 에러 메세지를 반환합니다.
  if (!todo) {
    return res
      .status(404)
      .json({ errorMessage: "존재하지 않는 해야할 일 정보입니다." });
  }
  // 3. 조회된 '해야할 일'을 삭제합니다
  await Todo.deleteOne({ _id: todoId }).exec();

  return res.status(200).json({});
});

export default router;
