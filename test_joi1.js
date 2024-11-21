import Joi from "joi";

// Joi 스키마를 정의합니다.
// object 타입을 joi로 검사하겠단 뜻
const schema = Joi.object({
  // 그 object의 name은 문자열 타입이고, 필수로 존재해야합니다.
  // 또 최소 3글자, 최대 30글자여야 합니다.
  name: Joi.string().min(3).max(30).required(),
});

// 검증할 데이터를 정의합니다.
const user = { name: "Foo Bar" };

// schema를 이용해 user 데이터를 검증합니다.
// 정상적인 경우엔 {value : 검증대상}으로 할당되고
// 오류가 있는 경우엔 {value : 검증대상, erro : 오류내용}으로 할당됨
const validation = schema.validate(user);

// 검증 결과값 중 error가 존재한다면 에러 메시지를 출력합니다.
if (validation.error) {
  console.log(validation.error.message);
} else {
  // 검증 결과값 중 error가 존재하지 않는다면, 데이터가 유효하다는 메시지를 출력합니다.
  console.log("Valid Data!");
}
