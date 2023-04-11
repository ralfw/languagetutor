export async function AskAsync(questions, onAnswer) {
    let i = 1;
    for (let question of questions){
        console.log();
        console.log(`${i++}. Q: ${question}`);
        const answer = prompt("A:");
        await onAnswer(question, answer);
    }
}
export function PresentResult(correct, explanation) {
    if (correct) console.log("Congratulations, that's correct!");
    else {
        console.log("Sorry, not correct. Explanation: " + explanation);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvTGFuZ3VhZ2UtVHV0b3IvbW9kdWxlcy9xYS9RQVBvcnRhbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgYXN5bmMgZnVuY3Rpb24gQXNrQXN5bmMocXVlc3Rpb25zOnN0cmluZ1tdLCBvbkFuc3dlcjogKHF1ZXN0aW9uOnN0cmluZywgYW5zd2VyOnN0cmluZykgPT4gdm9pZCkge1xuICBsZXQgaT0xO1xuICBmb3IobGV0IHF1ZXN0aW9uIG9mIHF1ZXN0aW9ucykge1xuICAgIGNvbnNvbGUubG9nKCk7XG4gICAgY29uc29sZS5sb2coYCR7aSsrfS4gUTogJHtxdWVzdGlvbn1gKTtcbiAgICBjb25zdCBhbnN3ZXIgPSBwcm9tcHQoXCJBOlwiKTtcbiAgICBhd2FpdCBvbkFuc3dlcihxdWVzdGlvbiwgYW5zd2VyKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gUHJlc2VudFJlc3VsdChjb3JyZWN0OmJvb2xlYW4sIGV4cGxhbmF0aW9uOnN0cmluZykge1xuICBpZiAoY29ycmVjdClcbiAgICBjb25zb2xlLmxvZyhcIkNvbmdyYXR1bGF0aW9ucywgdGhhdCdzIGNvcnJlY3QhXCIpO1xuICBlbHNlIHtcbiAgICBjb25zb2xlLmxvZyhcIlNvcnJ5LCBub3QgY29ycmVjdC4gRXhwbGFuYXRpb246IFwiICsgZXhwbGFuYXRpb24pXG4gIH1cbn0iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxlQUFlLFNBQVMsU0FBa0IsRUFBRSxRQUFrRCxFQUFFO0lBQ3JHLElBQUksSUFBRTtJQUNOLEtBQUksSUFBSSxZQUFZLFVBQVc7UUFDN0IsUUFBUSxHQUFHO1FBQ1gsUUFBUSxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksS0FBSyxFQUFFLFNBQVMsQ0FBQztRQUNwQyxNQUFNLFNBQVMsT0FBTztRQUN0QixNQUFNLFNBQVMsVUFBVTtJQUMzQjtBQUNGLENBQUM7QUFFRCxPQUFPLFNBQVMsY0FBYyxPQUFlLEVBQUUsV0FBa0IsRUFBRTtJQUNqRSxJQUFJLFNBQ0YsUUFBUSxHQUFHLENBQUM7U0FDVDtRQUNILFFBQVEsR0FBRyxDQUFDLHNDQUFzQztJQUNwRCxDQUFDO0FBQ0gsQ0FBQyJ9