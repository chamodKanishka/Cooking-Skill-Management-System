package paf.cookingapp.demo.model;

public class TimelineStep {
    private String step;
    private String duration;
    private boolean completed;

    public TimelineStep() {}

    public TimelineStep(String step, String duration, boolean completed) {
        this.step = step;
        this.duration = duration;
        this.completed = completed;
    }

    public String getStep() { return step; }
    public void setStep(String step) { this.step = step; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
}
