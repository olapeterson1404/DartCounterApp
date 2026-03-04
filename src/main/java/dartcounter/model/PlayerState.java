package dartcounter.model;

import java.util.ArrayList;
import java.util.List;

public class PlayerState {
    private String name;
    private int remaining;
    private int turnStartRemaining;
    private int dartsThrown;
    private int turnsCompleted;
    private int totalRoundPoints;
    private int setsWon;
    private int legsWonInSet;
    private int legsWonTotal;
    private boolean bustHighlight;
    private final List<ThrowHit> currentThrows = new ArrayList<>();

    public PlayerState(String name, int startScore) {
        this.name = name;
        this.remaining = startScore;
        this.turnStartRemaining = startScore;
    }

    public PlayerState copy() {
        PlayerState cloned = new PlayerState(name, remaining);
        cloned.turnStartRemaining = turnStartRemaining;
        cloned.dartsThrown = dartsThrown;
        cloned.turnsCompleted = turnsCompleted;
        cloned.totalRoundPoints = totalRoundPoints;
        cloned.setsWon = setsWon;
        cloned.legsWonInSet = legsWonInSet;
        cloned.legsWonTotal = legsWonTotal;
        cloned.bustHighlight = bustHighlight;
        cloned.currentThrows.clear();
        for (ThrowHit hit : currentThrows) {
            cloned.currentThrows.add(hit.copy());
        }
        return cloned;
    }

    public String getName() {
        return name;
    }

    public int getRemaining() {
        return remaining;
    }

    public void setRemaining(int remaining) {
        this.remaining = remaining;
    }

    public int getTurnStartRemaining() {
        return turnStartRemaining;
    }

    public void setTurnStartRemaining(int turnStartRemaining) {
        this.turnStartRemaining = turnStartRemaining;
    }

    public int getDartsThrown() {
        return dartsThrown;
    }

    public void incrementDartsThrown() {
        dartsThrown++;
    }

    public int getTurnsCompleted() {
        return turnsCompleted;
    }

    public void incrementTurnsCompleted() {
        turnsCompleted++;
    }

    public int getTotalRoundPoints() {
        return totalRoundPoints;
    }

    public void addRoundPoints(int points) {
        totalRoundPoints += points;
    }

    public int getSetsWon() {
        return setsWon;
    }

    public void incrementSetsWon() {
        setsWon++;
    }

    public int getLegsWonInSet() {
        return legsWonInSet;
    }

    public void incrementLegsWonInSet() {
        legsWonInSet++;
    }

    public void resetLegsWonInSet() {
        legsWonInSet = 0;
    }

    public int getLegsWonTotal() {
        return legsWonTotal;
    }

    public void incrementLegsWonTotal() {
        legsWonTotal++;
    }

    public boolean isBustHighlight() {
        return bustHighlight;
    }

    public void setBustHighlight(boolean bustHighlight) {
        this.bustHighlight = bustHighlight;
    }

    public List<ThrowHit> getCurrentThrows() {
        return currentThrows;
    }

    public void clearCurrentThrows() {
        currentThrows.clear();
    }
}
