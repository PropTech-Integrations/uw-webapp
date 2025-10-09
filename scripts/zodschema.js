import * as z from "zod";
 
const schema = z.object({
  name: z.string(),
  age: z.number(),
});
 
console.log(z.toJSONSchema(schema))