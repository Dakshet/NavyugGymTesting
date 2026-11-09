import React, { useEffect, useState } from 'react'
import "./TrackWorkout.css"

const TrackWorkout = () => {

    const [selectedExercise, setSelectedExercise] = useState("");

    // Exercise data with images and instructions
    // You can add your images to client/src/Images/exercises/ folder and update the paths
    const exerciseData = {
        "Bench Press": {
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
            instructions: [
                "Lie flat on the bench with your feet firmly on the ground",
                "Grip the bar slightly wider than shoulder-width apart",
                "Lower the bar to your chest with control",
                "Press the bar up explosively until your arms are fully extended",
                "Keep your core tight and maintain proper form throughout"
            ]
        },
        "Squat": {
            image: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=500",
            instructions: [
                "Stand with feet shoulder-width apart, toes slightly pointed out",
                "Keep your chest up and core engaged",
                "Lower your body by bending your knees and pushing your hips back",
                "Go down until your thighs are parallel to the floor",
                "Drive through your heels to return to the starting position"
            ]
        },
        "Deadlift": {
            image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500",
            instructions: [
                "Stand with feet hip-width apart, bar over mid-foot",
                "Bend at hips and knees to grip the bar",
                "Keep your back straight and chest up",
                "Drive through your heels and lift the bar",
                "Stand up straight, keeping the bar close to your body",
                "Lower the bar with control by reversing the movement"
            ]
        },
        "Shoulder Press": {
            image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500",
            instructions: [
                "Stand or sit with feet shoulder-width apart",
                "Hold the bar at shoulder height with palms facing forward",
                "Press the bar straight up overhead",
                "Fully extend your arms without locking your elbows",
                "Lower the bar back to shoulder height with control"
            ]
        },
        "Barbell Row": {
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
            instructions: [
                "Bend at the hips with knees slightly bent",
                "Grip the bar with hands slightly wider than shoulder-width",
                "Pull the bar to your lower chest/upper abdomen",
                "Squeeze your shoulder blades together at the top",
                "Lower the bar with control to the starting position"
            ]
        },
        "Pull-ups": {
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
            instructions: [
                "Hang from the bar with arms fully extended",
                "Grip the bar with palms facing away (overhand grip)",
                "Pull your body up until your chin is above the bar",
                "Focus on using your back muscles, not just your arms",
                "Lower yourself with control to the starting position"
            ]
        },
        "Push-ups": {
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
            instructions: [
                "Start in plank position with hands slightly wider than shoulders",
                "Keep your body in a straight line from head to heels",
                "Lower your body until your chest nearly touches the floor",
                "Push back up to the starting position",
                "Keep your core engaged throughout the movement"
            ]
        },
        "Dumbbell Curl": {
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
            instructions: [
                "Stand with feet shoulder-width apart, holding dumbbells at your sides",
                "Keep your elbows close to your body",
                "Curl the weights up by contracting your biceps",
                "Squeeze at the top of the movement",
                "Lower the weights with control to the starting position"
            ]
        },
        "Tricep Dips": {
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
            instructions: [
                "Sit on the edge of a bench or chair with hands gripping the edge",
                "Slide forward so your body is supported by your arms",
                "Lower your body by bending your elbows",
                "Go down until your elbows are at about 90 degrees",
                "Push back up to the starting position using your triceps"
            ]
        },
        "Leg Press": {
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
            instructions: [
                "Sit in the leg press machine with your back flat against the pad",
                "Place your feet shoulder-width apart on the platform",
                "Lower the weight by bending your knees",
                "Go down until your knees form a 90-degree angle",
                "Push the platform away by extending your legs"
            ]
        },
        "Leg Curl": {
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
            instructions: [
                "Lie face down on the leg curl machine",
                "Position your ankles under the padded lever",
                "Curl your legs up by contracting your hamstrings",
                "Bring your heels toward your glutes",
                "Lower the weight with control to the starting position"
            ]
        },
        "Leg Extension": {
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
            instructions: [
                "Sit in the leg extension machine with your back against the pad",
                "Place your shins behind the padded lever",
                "Extend your legs by contracting your quadriceps",
                "Lift until your legs are fully extended",
                "Lower the weight with control to the starting position"
            ]
        },
        "Calf Raise": {
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
            instructions: [
                "Stand with feet hip-width apart, holding weights if desired",
                "Rise up onto your toes by pushing through the balls of your feet",
                "Lift your heels as high as possible",
                "Hold for a moment at the top",
                "Lower your heels back to the ground with control"
            ]
        },
        "Lat Pulldown": {
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
            instructions: [
                "Sit at the lat pulldown machine with thighs secured",
                "Grip the bar wider than shoulder-width",
                "Pull the bar down to your upper chest",
                "Squeeze your lats at the bottom of the movement",
                "Control the weight back up to the starting position"
            ]
        },
        "Cable Fly": {
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
            instructions: [
                "Stand between two cable machines with handles at chest height",
                "Grab the handles with arms slightly bent",
                "Bring your arms together in front of your chest",
                "Squeeze your chest muscles at the peak",
                "Return to the starting position with control"
            ]
        },
        "Incline Bench Press": {
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
            instructions: [
                "Set the bench to a 30-45 degree incline",
                "Lie back with feet firmly on the ground",
                "Grip the bar slightly wider than shoulder-width",
                "Lower the bar to your upper chest",
                "Press the bar up explosively until arms are fully extended"
            ]
        },
        "Barbell Curl": {
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
            instructions: [
                "Stand with feet shoulder-width apart",
                "Hold the barbell with an underhand grip, arms extended",
                "Curl the bar up by contracting your biceps",
                "Keep your elbows close to your body",
                "Lower the bar with control to the starting position"
            ]
        },
        "Plank": {
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
            instructions: [
                "Start in push-up position on your forearms",
                "Keep your body in a straight line from head to heels",
                "Engage your core and glutes",
                "Hold the position while breathing normally",
                "Keep your hips level, don't let them sag or rise"
            ]
        },
        "Lunges": {
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
            instructions: [
                "Stand with feet hip-width apart",
                "Step forward with one leg, lowering your hips",
                "Bend both knees to 90 degrees",
                "Keep your front knee over your ankle",
                "Push back to the starting position and repeat with the other leg"
            ]
        }
    };

    // Get list of exercises from the data
    const exercises = Object.keys(exerciseData);

    // Get selected exercise details
    const selectedExerciseData = selectedExercise ? exerciseData[selectedExercise] : null;

    // Title change
    useEffect(() => {
        document.title = "Navyug Gym - Track Your Workout";
    }, []);

    const handleExerciseChange = (e) => {
        setSelectedExercise(e.target.value);
    };

    return (
        <div className='trackWorkout'>
            <h1>Track Your Workout</h1>
            <hr />
            <div className="trackWorkoutContainer">
                <div className="exerciseSelectBox">
                    <label htmlFor="exerciseSelect">Select Exercise</label>
                    <select
                        name="exerciseSelect"
                        id="exerciseSelect"
                        value={selectedExercise}
                        onChange={handleExerciseChange}
                    >
                        <option value="">Select Exercise Type</option>
                        {exercises.map((exercise, index) => (
                            <option key={index} value={exercise}>
                                {exercise}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedExerciseData && (
                    <div className="exerciseInfo">
                        <div className="exerciseImage">
                            <img
                                src={selectedExerciseData.image}
                                alt={selectedExercise}
                                onError={(e) => {
                                    e.target.src = "https://via.placeholder.com/400x300?text=Exercise+Image";
                                }}
                            />
                        </div>
                        <div className="exerciseDetails">
                            <h2>{selectedExercise}</h2>
                            <h3>How to Perform:</h3>
                            <ol className="instructionsList">
                                {selectedExerciseData.instructions.map((instruction, index) => (
                                    <li key={index}>{instruction}</li>
                                ))}
                            </ol>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TrackWorkout

