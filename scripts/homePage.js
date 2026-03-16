var BASE_URL = 'https://phi-lab-server.vercel.app/api/v1/lab';
        var cachedIssues = null;
        var currentTab = 'all';

        function toggleSpinner(show) {
            document.getElementById('spinner-section').style.display = show ? 'block' : 'none';
            document.getElementById('cards-section').style.display = show ? 'none' : 'grid';
        }

        function toggleModalSpinner(show) {
            document.getElementById('modal-spinner-wrap').style.display = show ? 'flex' : 'none';
            document.getElementById('modal-content').style.display = show ? 'none' : 'block';
        }

        function setActiveTab(tab) {
            currentTab = tab;
            document.querySelectorAll('.tab-btn').forEach(function(btn) {
                btn.classList.remove('btn-primary');
                if (btn.dataset.tab === tab) {
                    btn.classList.add('btn-primary');
                }
            });
        }

        function makeLabelPill(labelName) {
            var styles = {
                'bug': 'text-[#EF4444] bg-[#FEECEC] border-2 border-[#FECACA]',
                'help wanted': 'text-[#D97706] bg-[#FFF8DB] border-2 border-[#FDE68A]',
                'enhancement': 'text-[#00A96E] bg-[#DEFCE8] border-2 border-[#BBF7D0]',
                'good first issue': 'text-[#647aa1] bg-[#eaeffc] border-2 border-[#dde2f2]',
                'documentation': 'text-[#D97706] bg-[#FFF8DB] border-2 border-[#FDE68A]'
            };

            var icons = {
                'bug': '<i class="fa-solid fa-bug"></i>',
                'help wanted': '<i class="fa-solid fa-life-ring"></i>',
                'enhancement': '<img src="./assets/Sparkle.png" alt="" class="inline">'
            };

            var cls = styles[labelName] || 'text-gray-500 bg-gray-100 border-2 border-gray-200';
            var icon = icons[labelName] || '';

            return '<span class="flex items-center gap-1 text-xs py-1.5 px-3 rounded-full font-medium ' + cls + '">' + icon + ' ' + labelName.toUpperCase() + '</span>';
        }

        function getPriorityPill(p) {
            if (p === 'high') return '<span class="text-sm py-1.5 px-4 bg-[#FEECEC] text-red-500 rounded-full font-medium">' + p.toUpperCase() + '</span>';
            if (p === 'medium') return '<span class="text-sm py-1.5 px-4 text-[#D97706] bg-[#FFF8DB] rounded-full font-medium">' + p.toUpperCase() + '</span>';
            return '<span class="text-sm py-1.5 px-4 text-[#9CA3AF] bg-[#EEEFF2] rounded-full font-medium">' + p.toUpperCase() + '</span>';
        }

        function formatDate(dateStr) {
            return new Date(dateStr).toLocaleDateString('en-GB');
        }

        function showCards(list) {
            var section = document.getElementById('cards-section');
            section.innerHTML = '';

            document.getElementById('issues-count').textContent = list.length + ' Issues';

            if (list.length === 0) {
                section.innerHTML = '<div class="my-5 col-span-4 mx-auto text-center"><div class="text-orange-500 mb-3 bg-gray-200 p-3 rounded-full text-4xl"><i class="fa-solid fa-magnifying-glass-minus block"></i></div><h2 class="text-center text-2xl sm:text-3xl font-semibold text-gray-600">No Card Found</h2></div>';
                toggleSpinner(false);
                return;
            }

            list.forEach(function(item) {
                var borderColor = item.status === 'open' ? 'border-green-600' : 'border-purple-600';
                var statusIcon = item.status === 'open'
                    ? '<img class="size-6" src="./assets/Open-Status.png" alt="">'
                    : '<img class="size-6" src="./assets/Closed-Status.png" alt="">';

                var labelPills = item.labels.map(function(l) { return makeLabelPill(l); }).join('');

                var card = document.createElement('div');
                card.className = 'bg-base-100 shadow rounded-lg flex items-end border-t-5 ' + borderColor;
                card.style.cursor = 'pointer';
                card.addEventListener('click', function() {
                    openIssueModal(item.id);
                });

                card.innerHTML = '<div class="w-full">'
                    + '<div class="p-4 space-y-3">'
                    + '<div class="flex justify-between items-center gap-1">' + statusIcon + getPriorityPill(item.priority) + '</div>'
                    + '<div><h2 class="text-sm font-semibold mb-2">' + item.title + '</h2>'
                    + '<p class="text-xs font-normal text-[#64748B]">' + item.description + '</p></div>'
                    + '<div class="flex gap-1 sm:gap-2 xl:gap-1 flex-wrap">' + labelPills + '</div>'
                    + '</div>'
                    + '<hr class="border border-gray-300">'
                    + '<div class="p-4 space-y-2 text-[#64748B] text-xs">'
                    + '<p>' + item.author + '</p>'
                    + '<p>' + formatDate(item.createdAt) + '</p>'
                    + '</div></div>';

                section.appendChild(card);
            });

            toggleSpinner(false);
        }

        async function fetchAndShow(filterFn) {
            toggleSpinner(true);

            if (!cachedIssues) {
                var res = await fetch(BASE_URL + '/issues');
                var json = await res.json();
                cachedIssues = json.data;
            }

            var toShow = filterFn ? cachedIssues.filter(filterFn) : cachedIssues;
            showCards(toShow);
        }

        async function openIssueModal(id) {
            toggleModalSpinner(true);
            document.getElementById('issue-modal').showModal();

            var res = await fetch(BASE_URL + '/issue/' + id);
            var json = await res.json();
            var d = json.data;

            var statusBtn = d.status === 'open'
                ? '<button class="text-sm py-1.5 px-4 bg-green-600 text-white rounded-full font-medium">' + d.status + '</button>'
                : '<button class="text-sm py-1.5 px-4 bg-purple-600 text-white rounded-full font-medium">' + d.status + '</button>';

            var labelHtml = d.labels.map(function(l) { return makeLabelPill(l); }).join('');

            document.getElementById('modal-content').innerHTML = '<div class="space-y-6">'
                + '<div class="space-y-2">'
                + '<h2 class="text-2xl font-bold text-[#1F2937]">' + d.title + '</h2>'
                + '<div class="flex gap-3 items-center text-[#64748B]">'
                + statusBtn
                + '<div class="size-3 rounded-full bg-[#64748B]"></div>'
                + '<h2 class="text-xs mr-2">Opened by ' + d.author + '</h2>'
                + '<div class="size-3 rounded-full bg-[#64748B]"></div>'
                + '<h2 class="text-xs">' + formatDate(d.createdAt) + '</h2>'
                + '</div></div>'
                + '<div class="flex gap-2">' + labelHtml + '</div>'
                + '<p class="text-[#64748B]">' + d.description + '</p>'
                + '<div class="text-[#64748B] bg-base-200 p-4 flex justify-between">'
                + '<div class="space-y-2"><p>Assignee:</p><h2 class="font-bold text-[#1F2937]">' + (d.assignee || 'Unassigned') + '</h2></div>'
                + '<div class="space-y-2"><p>Priority:</p><button class="text-sm py-1 px-4 bg-red-600 text-white rounded-full font-medium">' + d.priority.toUpperCase() + '</button></div>'
                + '</div></div>';

            toggleModalSpinner(false);
        }

        document.querySelectorAll('.tab-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var tab = this.dataset.tab;
                setActiveTab(tab);
                if (tab === 'all') fetchAndShow(null);
                else fetchAndShow(function(issue) { return issue.status === tab; });
            });
        });

        document.getElementById('search-btn').addEventListener('click', async function() {
            var query = document.getElementById('search-field').value.trim().toLowerCase();
            toggleSpinner(true);

            if (!cachedIssues) {
                var res = await fetch(BASE_URL + '/issues');
                var json = await res.json();
                cachedIssues = json.data;
            }

            var results = cachedIssues.filter(function(issue) {
                return issue.title.toLowerCase().includes(query);
            });

            showCards(results);
        });

        fetchAndShow(null);