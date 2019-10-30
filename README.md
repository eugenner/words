# TODO

UI:
    + 1. Settings - languages pair
    + 2. Settings - number of words in Loop
    3. End of loop - hide word's table, (show some stat?)
    4. After first login
        1. create user in the backend's db 
        2. redirect to Settings page
        3. Route to Training page should check if Settings is not empty

+ 1. User social login
    1. Refresh token after expire
+ 2. Support user to backend interaction
3. Rules for learning logic (frontend / backend)
4. Support editing rules in the UI (rules customization)
5. Add Help section to UI
6. get DNS 
7. get SSL
8. get Digital Ocean hosting
9. use HTTPS



# Words

DB: Word
.User
    .id
    .session_id
    .login
    .google_uid
    .preferences (json in TEXT)
.Word
    .id
    .lang <- ru, en, ...
    .word
    .frequency
    .link_id <- links words of different languages (translation)
.UserProgress
    .id
    .user_id
    .word_id
    .cnt_error
    .cnt_success

Tools:
    https://www.layoutit.com/build

additional libs:
    https://ng-bootstrap.github.io/#/components/tooltip/examples
    https://material.angular.io/guide/getting-started
add swap:
    https://www.digitalocean.com/community/tutorials/how-to-add-swap-space-on-ubuntu-16-04


iptables -A INPUT -p tcp --dport 80 -j ACCEPT
npx ng serve --host=natasha-murasha.com --port=80 --prod 

# words
# words
