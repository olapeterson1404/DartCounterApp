package dartcounter.model;

import java.util.List;

public class GameSnapshot {
    private final List<PlayerState> players;
    private final int currentPlayerIndex;
    private final int pendingBustClearIndex;
    private final int currentSetNumber;
    private final int currentLegNumberInSet;
    private final boolean matchFinished;
    private final Multiplier selectedMultiplier;
    private final String statusText;

    public GameSnapshot(List<PlayerState> players, int currentPlayerIndex, int pendingBustClearIndex,
                        int currentSetNumber, int currentLegNumberInSet, boolean matchFinished,
                        Multiplier selectedMultiplier, String statusText) {
        this.players = players;
        this.currentPlayerIndex = currentPlayerIndex;
        this.pendingBustClearIndex = pendingBustClearIndex;
        this.currentSetNumber = currentSetNumber;
        this.currentLegNumberInSet = currentLegNumberInSet;
        this.matchFinished = matchFinished;
        this.selectedMultiplier = selectedMultiplier;
        this.statusText = statusText;
    }

    public List<PlayerState> getPlayers() {
        return players;
    }

    public int getCurrentPlayerIndex() {
        return currentPlayerIndex;
    }

    public int getPendingBustClearIndex() {
        return pendingBustClearIndex;
    }

    public int getCurrentSetNumber() {
        return currentSetNumber;
    }

    public int getCurrentLegNumberInSet() {
        return currentLegNumberInSet;
    }

    public boolean isMatchFinished() {
        return matchFinished;
    }

    public Multiplier getSelectedMultiplier() {
        return selectedMultiplier;
    }

    public String getStatusText() {
        return statusText;
    }
}
