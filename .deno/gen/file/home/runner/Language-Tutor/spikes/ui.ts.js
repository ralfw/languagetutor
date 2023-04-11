import { Ask, PresentResult } from "../modules/qa/QAPortal.ts";
Ask([
    "q1",
    "q2",
    "q3"
], (question, answer)=>{
    console.log("Q/A: " + question + "/" + answer);
});
PresentResult(true, "No explanation");
PresentResult(false, "An elaborate explanation");
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvTGFuZ3VhZ2UtVHV0b3Ivc3Bpa2VzL3VpLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFzaywgUHJlc2VudFJlc3VsdCB9IGZyb20gXCIuLi9tb2R1bGVzL3FhL1FBUG9ydGFsLnRzXCJcblxuQXNrKFtcInExXCIsIFwicTJcIiwgXCJxM1wiXSwgXG4gICAgKHF1ZXN0aW9uLCBhbnN3ZXIpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiUS9BOiBcIiArIHF1ZXN0aW9uICsgXCIvXCIgKyBhbnN3ZXIpO1xuICAgIH0pO1xuXG5cblByZXNlbnRSZXN1bHQodHJ1ZSwgXCJObyBleHBsYW5hdGlvblwiKTtcblByZXNlbnRSZXN1bHQoZmFsc2UsIFwiQW4gZWxhYm9yYXRlIGV4cGxhbmF0aW9uXCIpOyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLEdBQUcsRUFBRSxhQUFhLFFBQVEsNEJBQTJCO0FBRTlELElBQUk7SUFBQztJQUFNO0lBQU07Q0FBSyxFQUNsQixDQUFDLFVBQVUsU0FBVztJQUNwQixRQUFRLEdBQUcsQ0FBQyxVQUFVLFdBQVcsTUFBTTtBQUN6QztBQUdKLGNBQWMsSUFBSSxFQUFFO0FBQ3BCLGNBQWMsS0FBSyxFQUFFIn0=