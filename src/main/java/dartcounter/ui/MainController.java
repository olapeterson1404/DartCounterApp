package dartcounter.ui;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.prefs.Preferences;

import dartcounter.model.CheckoutRule;
import dartcounter.model.GameSettings;
import dartcounter.model.Multiplier;
import dartcounter.model.PlayerState;
import dartcounter.model.SetLegMode;
import dartcounter.model.ThrowHit;
import dartcounter.service.CheckoutEngine;
import dartcounter.service.GameEngine;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Label;
import javafx.scene.control.ListView;
import javafx.scene.control.TextField;
import javafx.scene.layout.FlowPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.layout.VBox;

public class MainController {
    @FXML
    private ComboBox<Integer> pointsBox;
    @FXML
    private ComboBox<String> checkoutBox;
    @FXML
    private ComboBox<Integer> setsBox;
    @FXML
    private ComboBox<Integer> legsBox;
    @FXML
    private ComboBox<String> setLegModeBox;

    @FXML
    private TextField playerNameField;
    @FXML
    private ListView<String> playerLibraryList;
    @FXML
    private ListView<String> selectedPlayersList;

    @FXML
    private Label setupStatusLabel;
    @FXML
    private Label gameStatusLabel;
    @FXML
    private Label gameTitleLabel;
    @FXML
    private Label gameSubtitleLabel;
    @FXML
    private Label checkoutHintLabel;
    @FXML
    private Label checkoutAlt1Label;
    @FXML
    private Label checkoutAlt2Label;
    @FXML
    private Label checkoutAlt3Label;

    @FXML
    private VBox setupPane;
    @FXML
    private VBox gamePane;
    @FXML
    private VBox playersBoard;
    @FXML
    private FlowPane numberPad;

    @FXML
    private Button doubleButton;
    @FXML
    private Button tripleButton;

    private final Preferences prefs = Preferences.userNodeForPackage(MainController.class);
    private final ObservableList<String> playerLibrary = FXCollections.observableArrayList();
    private final ObservableList<String> selectedPlayers = FXCollections.observableArrayList();
    private final CheckoutEngine checkoutEngine = new CheckoutEngine();

    private GameEngine gameEngine;

    @FXML
    private void initialize() {
        setupCombos();
        setupPlayerLists();
        setupNumberPad();
        loadPlayerLibrary();
        showSetupPane();
    }

    @FXML
    private void onAddPlayerToLibrary() {
        String name = playerNameField.getText() == null ? "" : playerNameField.getText().trim();
        if (name.isEmpty()) {
            setupStatusLabel.setText("Skriv ett namn innan du trycker Lägg till.");
            return;
        }
        if (playerLibrary.contains(name)) {
            setupStatusLabel.setText("Spelaren finns redan i listan.");
            return;
        }
        playerLibrary.add(name);
        playerLibrary.sort(String::compareToIgnoreCase);
        playerNameField.clear();
        setupStatusLabel.setText("Spelare sparad.");
        savePlayerLibrary();
    }

    @FXML
    private void onAddSelectedPlayer() {
        String selected = playerLibraryList.getSelectionModel().getSelectedItem();
        if (selected == null) {
            setupStatusLabel.setText("Välj en spelare i listan först.");
            return;
        }
        if (selectedPlayers.size() >= 5) {
            setupStatusLabel.setText("Max 5 spelare per match.");
            return;
        }
        if (selectedPlayers.contains(selected)) {
            setupStatusLabel.setText("Spelaren är redan tillagd i matchen.");
            return;
        }
        selectedPlayers.add(selected);
        selectedPlayersList.getSelectionModel().select(selectedPlayers.size() - 1);
        setupStatusLabel.setText("");
    }

    @FXML
    private void onRemoveSelectedPlayer() {
        int index = selectedPlayersList.getSelectionModel().getSelectedIndex();
        if (index < 0) {
            setupStatusLabel.setText("Välj en spelare i Matchspelare-listan.");
            return;
        }
        selectedPlayers.remove(index);
        if (!selectedPlayers.isEmpty()) {
            selectedPlayersList.getSelectionModel().select(Math.min(index, selectedPlayers.size() - 1));
        }
    }

    @FXML
    private void onMovePlayerUp() {
        moveSelectedPlayer(-1);
    }

    @FXML
    private void onMovePlayerDown() {
        moveSelectedPlayer(1);
    }

    @FXML
    private void onStartGame() {
        if (selectedPlayers.isEmpty()) {
            setupStatusLabel.setText("Lägg till minst en spelare i matchen.");
            return;
        }

        GameSettings settings = new GameSettings(
                pointsBox.getValue(),
                parseCheckoutRule(checkoutBox.getValue()),
                setsBox.getValue(),
                legsBox.getValue(),
                "Best of".equals(setLegModeBox.getValue()) ? SetLegMode.BEST_OF : SetLegMode.FIRST_TO
        );

        gameEngine = new GameEngine(settings, new ArrayList<>(selectedPlayers));
        gameStatusLabel.setText("");
        refreshModifierButtons();
        renderGameState();
        showGamePane();
    }

    @FXML
    private void onBackToSetup() {
        showSetupPane();
    }

    @FXML
    private void onSetDoubleModifier() {
        if (gameEngine == null || gameEngine.isMatchFinished()) {
            return;
        }
        gameEngine.setSelectedMultiplier(Multiplier.DOUBLE);
        refreshModifierButtons();
    }

    @FXML
    private void onSetTripleModifier() {
        if (gameEngine == null || gameEngine.isMatchFinished()) {
            return;
        }
        gameEngine.setSelectedMultiplier(Multiplier.TRIPLE);
        refreshModifierButtons();
    }

    @FXML
    private void onUndoLastThrow() {
        if (gameEngine == null) {
            return;
        }
        gameEngine.undoLastThrow();
        refreshModifierButtons();
        renderGameState();
    }

    private void setupCombos() {
        pointsBox.setItems(FXCollections.observableArrayList(301, 501, 201, 101));
        pointsBox.getSelectionModel().select(Integer.valueOf(301));

        checkoutBox.setItems(FXCollections.observableArrayList("Straight out", "Double out", "Master out"));
        checkoutBox.getSelectionModel().select("Straight out");

        setsBox.setItems(FXCollections.observableArrayList(1, 2, 3, 4, 5));
        setsBox.getSelectionModel().select(Integer.valueOf(1));

        legsBox.setItems(FXCollections.observableArrayList(1, 2, 3, 4, 5));
        legsBox.getSelectionModel().select(Integer.valueOf(1));

        setLegModeBox.setItems(FXCollections.observableArrayList("First to", "Best of"));
        setLegModeBox.getSelectionModel().select("First to");
    }

    private void setupPlayerLists() {
        playerLibraryList.setItems(playerLibrary);
        selectedPlayersList.setItems(selectedPlayers);
    }

    private void setupNumberPad() {
        numberPad.getChildren().clear();
        List<Integer> values = new ArrayList<>();
        for (int i = 1; i <= 20; i++) {
            values.add(i);
        }
        values.add(25);
        values.add(0);

        for (Integer value : values) {
            Button button = new Button(String.valueOf(value));
            button.getStyleClass().add("score-button");
            button.setOnAction(event -> onScoreInput(value));
            numberPad.getChildren().add(button);
        }
    }

    private void onScoreInput(int baseValue) {
        if (gameEngine == null) {
            return;
        }
        gameEngine.applyThrow(baseValue);
        refreshModifierButtons();
        renderGameState();
    }

    private void renderGameState() {
        if (gameEngine == null || gameEngine.getPlayers().isEmpty()) {
            return;
        }

        GameSettings settings = gameEngine.getSettings();
        String checkoutLabel = switch (settings.getCheckoutRule()) {
            case STRAIGHT_OUT -> "Straight out";
            case DOUBLE_OUT -> "Double out";
            case MASTER_OUT -> "Master out";
        };
        String modeLabel = settings.getSetLegMode() == SetLegMode.FIRST_TO ? "First to" : "Best of";

        gameTitleLabel.setText(String.valueOf(settings.getStartScore()));
        gameSubtitleLabel.setText(
                checkoutLabel + " | " + modeLabel
                        + " | Set " + gameEngine.getCurrentSetNumber() + " (" + settings.getSetsTarget() + " att vinna)"
                        + " | Leg " + gameEngine.getCurrentLegNumberInSet() + " (" + settings.getLegsTarget() + " att vinna)"
        );

        gameStatusLabel.setText(gameEngine.getStatusMessage());

        playersBoard.getChildren().clear();
        List<PlayerState> players = gameEngine.getPlayers();
        for (int i = 0; i < players.size(); i++) {
            playersBoard.getChildren().add(buildPlayerRow(players.get(i), i));
        }

        if (!gameEngine.isMatchFinished()) {
            PlayerState current = players.get(gameEngine.getCurrentPlayerIndex());
            List<String> suggestions = checkoutEngine.buildSuggestions(current.getRemaining(), settings.getCheckoutRule(), 4);
            if (suggestions.isEmpty()) {
                checkoutHintLabel.setText("Checkout-forslag: Ingen 3-pils checkout");
                checkoutAlt1Label.setText("");
                checkoutAlt2Label.setText("");
                checkoutAlt3Label.setText("");
            } else {
                checkoutHintLabel.setText("Checkout-forslag: " + suggestions.get(0));
                checkoutAlt1Label.setText(suggestions.size() > 1 ? "Alt 1: " + suggestions.get(1) : "");
                checkoutAlt2Label.setText(suggestions.size() > 2 ? "Alt 2: " + suggestions.get(2) : "");
                checkoutAlt3Label.setText(suggestions.size() > 3 ? "Alt 3: " + suggestions.get(3) : "");
            }
        } else {
            checkoutHintLabel.setText("Matchen ar klar.");
            checkoutAlt1Label.setText("");
            checkoutAlt2Label.setText("");
            checkoutAlt3Label.setText("");
        }
    }

    private HBox buildPlayerRow(PlayerState player, int index) {
        HBox row = new HBox(10);
        row.getStyleClass().add("player-row");
        row.setAlignment(Pos.TOP_LEFT);

        Region turnBar = new Region();
        turnBar.getStyleClass().add("turn-bar");

        if (player.isBustHighlight()) {
            turnBar.getStyleClass().add("turn-bar-bust");
        } else if (index == gameEngine.getCurrentPlayerIndex() && !gameEngine.isMatchFinished()) {
            turnBar.getStyleClass().add("turn-bar-active");
        }

        VBox content = new VBox(6);
        HBox.setHgrow(content, Priority.ALWAYS);

        HBox topRow = new HBox(8);
        topRow.setAlignment(Pos.TOP_LEFT);

        VBox playerInfo = new VBox(2);
        Label scoreLabel = new Label(String.valueOf(player.getRemaining()));
        scoreLabel.getStyleClass().add("score-value");

        Label nameLabel = new Label(player.getName());
        nameLabel.getStyleClass().add("player-name");
        HBox.setHgrow(playerInfo, Priority.ALWAYS);
        playerInfo.getChildren().addAll(scoreLabel, nameLabel);

        VBox stats = new VBox(4);
        stats.setAlignment(Pos.CENTER_RIGHT);

        Label dartsLabel = new Label("-> " + player.getDartsThrown());
        dartsLabel.getStyleClass().add("stat-label");

        double avg = player.getTurnsCompleted() == 0 ? 0.0
                : (double) player.getTotalRoundPoints() / player.getTurnsCompleted();
        Label avgLabel = new Label("Snitt/runda: " + String.format(Locale.US, "%.1f", avg));
        avgLabel.getStyleClass().add("stat-label");

        Label setsLabel = new Label("Set: " + player.getSetsWon() + " | Leg: " + player.getLegsWonInSet());
        setsLabel.getStyleClass().add("stat-label");

        stats.getChildren().addAll(dartsLabel, avgLabel, setsLabel);

        topRow.getChildren().addAll(playerInfo, stats);

        HBox throwBoxes = new HBox(6);
        throwBoxes.getStyleClass().add("throw-boxes");
        int turnTotal = 0;
        List<ThrowHit> throwsList = player.getCurrentThrows();
        for (int i = 0; i < 3; i++) {
            Label box = new Label(" ");
            box.getStyleClass().add("throw-box");
            if (i < throwsList.size()) {
                ThrowHit hit = throwsList.get(i);
                box.setText(hit.getLabel());
                turnTotal += hit.getScore();
                if (hit.getMultiplier() == 2) {
                    box.getStyleClass().add("throw-double");
                } else if (hit.getMultiplier() == 3) {
                    box.getStyleClass().add("throw-triple");
                }
            }
            throwBoxes.getChildren().add(box);
        }

        Label roundTotalLabel = new Label("Runda: " + turnTotal);
        roundTotalLabel.getStyleClass().add("round-total");

        content.getChildren().addAll(topRow, throwBoxes, roundTotalLabel);
        row.getChildren().addAll(turnBar, content);
        return row;
    }

    private CheckoutRule parseCheckoutRule(String label) {
        if ("Double out".equals(label)) {
            return CheckoutRule.DOUBLE_OUT;
        }
        if ("Master out".equals(label)) {
            return CheckoutRule.MASTER_OUT;
        }
        return CheckoutRule.STRAIGHT_OUT;
    }

    private void moveSelectedPlayer(int direction) {
        int index = selectedPlayersList.getSelectionModel().getSelectedIndex();
        if (index < 0) {
            return;
        }

        int newIndex = index + direction;
        if (newIndex < 0 || newIndex >= selectedPlayers.size()) {
            return;
        }

        String player = selectedPlayers.remove(index);
        selectedPlayers.add(newIndex, player);
        selectedPlayersList.getSelectionModel().select(newIndex);
    }

    private void showSetupPane() {
        setupPane.setVisible(true);
        setupPane.setManaged(true);
        gamePane.setVisible(false);
        gamePane.setManaged(false);
    }

    private void showGamePane() {
        setupPane.setVisible(false);
        setupPane.setManaged(false);
        gamePane.setVisible(true);
        gamePane.setManaged(true);
    }

    private void refreshModifierButtons() {
        doubleButton.getStyleClass().remove("modifier-selected");
        tripleButton.getStyleClass().remove("modifier-selected");

        if (gameEngine != null) {
            if (gameEngine.getSelectedMultiplier() == Multiplier.DOUBLE) {
                doubleButton.getStyleClass().add("modifier-selected");
            } else if (gameEngine.getSelectedMultiplier() == Multiplier.TRIPLE) {
                tripleButton.getStyleClass().add("modifier-selected");
            }
        }
    }

    private void loadPlayerLibrary() {
        String raw = prefs.get("dartPlayers", "");
        if (raw.isBlank()) {
            return;
        }

        for (String line : raw.split("\\n")) {
            String name = line.trim();
            if (!name.isEmpty() && !playerLibrary.contains(name)) {
                playerLibrary.add(name);
            }
        }
        playerLibrary.sort(String::compareToIgnoreCase);
    }

    private void savePlayerLibrary() {
        StringBuilder builder = new StringBuilder();
        for (String name : playerLibrary) {
            if (!builder.isEmpty()) {
                builder.append('\n');
            }
            builder.append(name);
        }
        prefs.put("dartPlayers", builder.toString());
    }
}
