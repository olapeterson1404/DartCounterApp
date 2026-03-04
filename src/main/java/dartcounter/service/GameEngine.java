package dartcounter.service;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

import dartcounter.model.CheckoutRule;
import dartcounter.model.GameSettings;
import dartcounter.model.GameSnapshot;
import dartcounter.model.Multiplier;
import dartcounter.model.PlayerState;
import dartcounter.model.ThrowHit;

public class GameEngine {
    private final GameSettings settings;
    private final List<PlayerState> players = new ArrayList<>();
    private final Deque<GameSnapshot> undoStack = new ArrayDeque<>();

    private int currentPlayerIndex = 0;
    private int pendingBustClearIndex = -1;
    private int currentSetNumber = 1;
    private int currentLegNumberInSet = 1;
    private boolean matchFinished = false;
    private Multiplier selectedMultiplier = Multiplier.SINGLE;
    private String statusMessage = "";

    public GameEngine(GameSettings settings, List<String> playerNames) {
        this.settings = settings;
        for (String name : playerNames) {
            players.add(new PlayerState(name, settings.getStartScore()));
        }
    }

    public void setSelectedMultiplier(Multiplier selectedMultiplier) {
        this.selectedMultiplier = selectedMultiplier;
    }

    public Multiplier getSelectedMultiplier() {
        return selectedMultiplier;
    }

    public boolean isMatchFinished() {
        return matchFinished;
    }

    public List<PlayerState> getPlayers() {
        return players;
    }

    public int getCurrentPlayerIndex() {
        return currentPlayerIndex;
    }

    public int getCurrentSetNumber() {
        return currentSetNumber;
    }

    public int getCurrentLegNumberInSet() {
        return currentLegNumberInSet;
    }

    public String getStatusMessage() {
        return statusMessage;
    }

    public GameSettings getSettings() {
        return settings;
    }

    public boolean hasUndo() {
        return !undoStack.isEmpty();
    }

    public void undoLastThrow() {
        if (undoStack.isEmpty()) {
            statusMessage = "Inget att ångra.";
            return;
        }

        restoreSnapshot(undoStack.pop());
    }

    public void applyThrow(int baseValue) {
        if (players.isEmpty() || matchFinished) {
            return;
        }

        PlayerState current = players.get(currentPlayerIndex);
        if (current.getCurrentThrows().size() >= 3) {
            return;
        }

        if (baseValue == 25 && selectedMultiplier == Multiplier.TRIPLE) {
            statusMessage = "Triple 25 finns inte på tavlan.";
            return;
        }

        undoStack.push(captureSnapshot());

        ThrowHit hit = createHit(baseValue, selectedMultiplier);
        current.getCurrentThrows().add(hit);
        current.incrementDartsThrown();

        int throwsInCurrentTurn = current.getCurrentThrows().size();
        int projectedRemaining = current.getRemaining() - hit.getScore();

        if (pendingBustClearIndex >= 0 && throwsInCurrentTurn == 1) {
            players.get(pendingBustClearIndex).setBustHighlight(false);
            pendingBustClearIndex = -1;
        }

        boolean bust = projectedRemaining < 0;
        if (!bust && settings.getCheckoutRule() != CheckoutRule.STRAIGHT_OUT && projectedRemaining == 1) {
            bust = true;
        }
        if (!bust && projectedRemaining == 0 && !isValidFinishingThrow(hit)) {
            bust = true;
        }

        if (bust) {
            handleBust(current);
            selectedMultiplier = Multiplier.SINGLE;
            return;
        }

        current.setRemaining(projectedRemaining);

        if (current.getRemaining() == 0) {
            finalizeCompletedTurn(current);
            processLegWin(currentPlayerIndex);
            selectedMultiplier = Multiplier.SINGLE;
            return;
        }

        if (current.getCurrentThrows().size() == 3) {
            finalizeCompletedTurn(current);
            advanceToNextPlayer();
            statusMessage = "";
        }

        selectedMultiplier = Multiplier.SINGLE;
    }

    private GameSnapshot captureSnapshot() {
        List<PlayerState> copiedPlayers = new ArrayList<>();
        for (PlayerState player : players) {
            copiedPlayers.add(player.copy());
        }

        return new GameSnapshot(
                copiedPlayers,
                currentPlayerIndex,
                pendingBustClearIndex,
                currentSetNumber,
                currentLegNumberInSet,
                matchFinished,
                selectedMultiplier,
                statusMessage
        );
    }

    private void restoreSnapshot(GameSnapshot snapshot) {
        players.clear();
        for (PlayerState player : snapshot.getPlayers()) {
            players.add(player.copy());
        }
        currentPlayerIndex = snapshot.getCurrentPlayerIndex();
        pendingBustClearIndex = snapshot.getPendingBustClearIndex();
        currentSetNumber = snapshot.getCurrentSetNumber();
        currentLegNumberInSet = snapshot.getCurrentLegNumberInSet();
        matchFinished = snapshot.isMatchFinished();
        selectedMultiplier = snapshot.getSelectedMultiplier();
        statusMessage = snapshot.getStatusText();
    }

    private ThrowHit createHit(int baseValue, Multiplier multiplier) {
        int multiplierValue = switch (multiplier) {
            case SINGLE -> 1;
            case DOUBLE -> 2;
            case TRIPLE -> 3;
        };

        int score = baseValue * multiplierValue;
        String label;
        if (multiplier == Multiplier.DOUBLE) {
            label = "D" + baseValue;
        } else if (multiplier == Multiplier.TRIPLE) {
            label = "T" + baseValue;
        } else {
            label = String.valueOf(baseValue);
        }

        return new ThrowHit(baseValue, multiplierValue, score, label);
    }

    private boolean isValidFinishingThrow(ThrowHit hit) {
        if (settings.getCheckoutRule() == CheckoutRule.STRAIGHT_OUT) {
            return true;
        }
        if (settings.getCheckoutRule() == CheckoutRule.DOUBLE_OUT) {
            return hit.getMultiplier() == 2;
        }
        return hit.getMultiplier() == 2 || hit.getMultiplier() == 3;
    }

    private void finalizeCompletedTurn(PlayerState player) {
        int roundPoints = player.getTurnStartRemaining() - player.getRemaining();
        player.incrementTurnsCompleted();
        player.addRoundPoints(roundPoints);
        player.clearCurrentThrows();
    }

    private void handleBust(PlayerState current) {
        current.setRemaining(current.getTurnStartRemaining());
        current.incrementTurnsCompleted();
        current.clearCurrentThrows();
        current.setBustHighlight(true);
        pendingBustClearIndex = currentPlayerIndex;
        statusMessage = current.getName() + " blev tjock (bust). Poängen återställdes.";
        advanceToNextPlayer();
    }

    private void processLegWin(int winnerIndex) {
        PlayerState winner = players.get(winnerIndex);
        winner.incrementLegsWonInSet();
        winner.incrementLegsWonTotal();

        boolean setWon = winner.getLegsWonInSet() >= settings.getLegsTarget();
        if (setWon) {
            winner.incrementSetsWon();
            if (winner.getSetsWon() >= settings.getSetsTarget()) {
                matchFinished = true;
                statusMessage = winner.getName() + " vann matchen.";
                return;
            }

            for (PlayerState player : players) {
                player.resetLegsWonInSet();
            }
            currentSetNumber++;
            currentLegNumberInSet = 1;
            statusMessage = winner.getName() + " vann setet. Nytt set startat.";
            startNewLeg(winnerIndex);
            return;
        }

        currentLegNumberInSet++;
        statusMessage = winner.getName() + " vann leget. Nytt leg startat.";
        startNewLeg(winnerIndex);
    }

    private void startNewLeg(int starterIndex) {
        for (PlayerState player : players) {
            player.setRemaining(settings.getStartScore());
            player.setTurnStartRemaining(settings.getStartScore());
            player.clearCurrentThrows();
            player.setBustHighlight(false);
        }
        currentPlayerIndex = starterIndex;
        pendingBustClearIndex = -1;
    }

    private void advanceToNextPlayer() {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.size();
        PlayerState next = players.get(currentPlayerIndex);
        next.setTurnStartRemaining(next.getRemaining());
        next.clearCurrentThrows();
    }
}
