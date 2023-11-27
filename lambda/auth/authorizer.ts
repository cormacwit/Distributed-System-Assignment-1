import { APIGatewayRequestAuthorizerHandler } from "aws-lambda";
import { CookieMap, createPolicy, parseCookies, verifyToken } from "../utils";

export const handler: APIGatewayRequestAuthorizerHandler = async (event) => {
  console.log("[EVENT]", event);

  const cookies: CookieMap = parseCookies(event);

  if (!cookies) {
    return {
      principalId: "",
      policyDocument: createPolicy(event, "Deny"),
    };
  }

  const userPoolId = process.env.USER_POOL_ID;
  const region = process.env.REGION;
  let verifiedJwt;

  if (userPoolId && region) {
    verifiedJwt = await verifyToken(cookies.jwt, userPoolId, region);
  }


  return {
    principalId: verifiedJwt ? verifiedJwt.sub!.toString() : "",
    policyDocument: createPolicy(event, verifiedJwt ? "Allow" : "Deny"),
  };
};