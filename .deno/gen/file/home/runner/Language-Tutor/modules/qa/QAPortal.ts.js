export function Ask(questions, onAnswer) {
    let i = 1;
    for (let question of questions){
        console.log();
        console.log(`${i++}. Q: ${question}`);
        const answer = prompt("A:");
        onAnswer(question, answer);
    }
}
export function PresentResult(correct, explanation) {
    if (correct) console.log("Congratulations, that's correct!");
    else {
        console.log("Sorry, not correct. Explanation: " + explanation);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvTGFuZ3VhZ2UtVHV0b3IvbW9kdWxlcy9xYS9RQVBvcnRhbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gQXNrKHF1ZXN0aW9uczpzdHJpbmdbXSwgb25BbnN3ZXI6IChxdWVzdGlvbjpzdHJpbmcsIGFuc3dlcjpzdHJpbmcpID0+IHZvaWQpIHtcbiAgbGV0IGk9MTtcbiAgZm9yKGxldCBxdWVzdGlvbiBvZiBxdWVzdGlvbnMpIHtcbiAgICBjb25zb2xlLmxvZygpO1xuICAgIGNvbnNvbGUubG9nKGAke2krK30uIFE6ICR7cXVlc3Rpb259YCk7XG4gICAgY29uc3QgYW5zd2VyID0gcHJvbXB0KFwiQTpcIik7XG4gICAgb25BbnN3ZXIocXVlc3Rpb24sIGFuc3dlcik7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFByZXNlbnRSZXN1bHQoY29ycmVjdDpib29sZWFuLCBleHBsYW5hdGlvbjpzdHJpbmcpIHtcbiAgaWYgKGNvcnJlY3QpXG4gICAgY29uc29sZS5sb2coXCJDb25ncmF0dWxhdGlvbnMsIHRoYXQncyBjb3JyZWN0IVwiKTtcbiAgZWxzZSB7XG4gICAgY29uc29sZS5sb2coXCJTb3JyeSwgbm90IGNvcnJlY3QuIEV4cGxhbmF0aW9uOiBcIiArIGV4cGxhbmF0aW9uKVxuICB9XG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sU0FBUyxJQUFJLFNBQWtCLEVBQUUsUUFBa0QsRUFBRTtJQUMxRixJQUFJLElBQUU7SUFDTixLQUFJLElBQUksWUFBWSxVQUFXO1FBQzdCLFFBQVEsR0FBRztRQUNYLFFBQVEsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLEtBQUssRUFBRSxTQUFTLENBQUM7UUFDcEMsTUFBTSxTQUFTLE9BQU87UUFDdEIsU0FBUyxVQUFVO0lBQ3JCO0FBQ0YsQ0FBQztBQUVELE9BQU8sU0FBUyxjQUFjLE9BQWUsRUFBRSxXQUFrQixFQUFFO0lBQ2pFLElBQUksU0FDRixRQUFRLEdBQUcsQ0FBQztTQUNUO1FBQ0gsUUFBUSxHQUFHLENBQUMsc0NBQXNDO0lBQ3BELENBQUM7QUFDSCxDQUFDIn0=