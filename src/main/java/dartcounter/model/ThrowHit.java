package dartcounter.model;

public class ThrowHit {
    private final int base;
    private final int multiplier;
    private final int score;
    private final String label;

    public ThrowHit(int base, int multiplier, int score, String label) {
        this.base = base;
        this.multiplier = multiplier;
        this.score = score;
        this.label = label;
    }

    public int getBase() {
        return base;
    }

    public int getMultiplier() {
        return multiplier;
    }

    public int getScore() {
        return score;
    }

    public String getLabel() {
        return label;
    }

    public ThrowHit copy() {
        return new ThrowHit(base, multiplier, score, label);
    }
}
